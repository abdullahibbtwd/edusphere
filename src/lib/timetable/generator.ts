import { prisma } from '@/lib/db';
import { hasConflict, type ScheduleEntry } from './conflict-checker';

type Allocation = {
    id: string;
    teacherId: string;
    teacherName: string;
    subjectId: string;
    subjectName: string;
    classId: string;
    className: string;
    hoursPerWeek: number;
    requiresDoublePeriod: boolean;
};

type TimeSlot = {
    day: string;
    period: number;
    startTime: string;
    endTime: string;
};

type PlacementTask = {
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    classId: string;
    className: string;
    isDouble: boolean;
};

const WORKING_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

// Track how many times each subject appears on each day
const subjectDayCount = new Map<string, Map<string, number>>();

function getSubjectDayCount(subjectId: string, day: string): number {
    return subjectDayCount.get(subjectId)?.get(day) || 0;
}

function incrementSubjectDayCount(subjectId: string, day: string): void {
    if (!subjectDayCount.has(subjectId)) {
        subjectDayCount.set(subjectId, new Map());
    }
    const dayMap = subjectDayCount.get(subjectId)!;
    dayMap.set(day, (dayMap.get(day) || 0) + 1);
}

/**
 * Main timetable generation function for a single class
 * Uses task-based round-robin placement with per-day limits
 */
export async function generateTimetableForClass(
    schoolId: string,
    classId: string,
    term: string,
    globalSchedule?: Map<string, ScheduleEntry>,
    globalTeacherLoad?: Map<string, number>
): Promise<ScheduleEntry[]> {

    // Fetch configuration
    const config = await prisma.timetableConfig.findUnique({
        where: { schoolId }
    });

    if (!config) {
        throw new Error('Timetable configuration not found. Please configure your school hours first.');
    }

    // Generate all available time slots based on config
    const allSlots = buildTimeSlots(config);
    const totalPeriods = allSlots.length;

    // Fetch all subject allocations for this class
    const allocations = await fetchAllocations(schoolId, classId);

    if (allocations.length === 0) {
        throw new Error('No subject allocations found for this class. Please assign teachers to subjects first.');
    }

    // STEP 1: Calculate subject occurrences
    const singleCount = allocations.filter(a => !a.requiresDoublePeriod).length;
    const doubleCount = allocations.filter(a => a.requiresDoublePeriod).length;
    const totalWeight = singleCount + (doubleCount * 2);

    if (totalWeight === 0) {
        throw new Error('No subjects to schedule.');
    }

    const baseOccurrences = Math.floor(totalPeriods / totalWeight);
    let remainder = totalPeriods % totalWeight;

    // Assign required occurrences to each subject
    const subjectOccurrences = allocations.map(s => ({
        ...s,
        requiredOccurrences: baseOccurrences
    }));

    // Distribute remainder periods
    let i = 0;
    while (remainder > 0) {
        const subject = subjectOccurrences[i % subjectOccurrences.length];
        if (subject.requiresDoublePeriod && remainder >= 2) {
            subject.requiredOccurrences += 1;
            remainder -= 2;
        } else if (!subject.requiresDoublePeriod && remainder >= 1) {
            subject.requiredOccurrences += 1;
            remainder -= 1;
        }
        i++;
        // Safety break
        if (i > subjectOccurrences.length * 3 && remainder > 0) {
            if (singleCount === 0 && remainder < 2) break;
        }
    }

    // STEP 2: Create placement tasks
    const tasks: PlacementTask[] = [];
    subjectOccurrences.forEach(s => {
        for (let j = 0; j < s.requiredOccurrences; j++) {
            tasks.push({
                subjectId: s.subjectId,
                subjectName: s.subjectName,
                teacherId: s.teacherId,
                teacherName: s.teacherName,
                classId: s.classId,
                className: s.className,
                isDouble: s.requiresDoublePeriod
            });
        }
    });

    // STEP 3: Sort tasks (double first, then by teacher global load)
    tasks.sort((a, b) => {
        if (a.isDouble && !b.isDouble) return -1;
        if (!a.isDouble && b.isDouble) return 1;
        const loadA = globalTeacherLoad?.get(a.teacherId) || 0;
        const loadB = globalTeacherLoad?.get(b.teacherId) || 0;
        return loadB - loadA;
    });

    // STEP 4: Place all tasks
    const schedule = new Map<string, ScheduleEntry>();
    subjectDayCount.clear(); // Reset for this class

    for (const task of tasks) {
        const occurrences = subjectOccurrences.find(s => s.subjectId === task.subjectId)!.requiredOccurrences;
        const maxPerDay = Math.ceil(occurrences / 5);

        let success = false;
        if (task.isDouble) {
            success = placeDoubleTask(task, schedule, allSlots, globalSchedule, maxPerDay);
        } else {
            success = placeSingleTask(task, schedule, allSlots, globalSchedule, maxPerDay);
        }

        if (!success) {
            console.warn(
                `⚠️ Failed to place ${task.subjectName} (${task.isDouble ? 'double' : 'single'})`
            );
        }
    }

    // Lock this class's schedule in the global map
    if (globalSchedule) {
        for (const [key, entry] of schedule.entries()) {
            globalSchedule.set(`${classId}-${key}`, entry);
        }
    }

    return Array.from(schedule.values());
}

/**
 * Place a double-period task with round-robin and per-day limit
 */
function placeDoubleTask(
    task: PlacementTask,
    schedule: Map<string, ScheduleEntry>,
    allSlots: TimeSlot[],
    globalSchedule: Map<string, ScheduleEntry> | undefined,
    maxPerDay: number
): boolean {
    // Find all available consecutive pairs
    const pairs: { slot1: TimeSlot; slot2: TimeSlot }[] = [];

    for (let i = 0; i < allSlots.length - 1; i++) {
        const slot1 = allSlots[i];
        const slot2 = allSlots[i + 1];

        if (slot1.day === slot2.day && slot2.period === slot1.period + 1) {
            const key1 = `${slot1.day}-${slot1.period}`;
            const key2 = `${slot2.day}-${slot2.period}`;

            if (schedule.has(key1) || schedule.has(key2)) continue;

            const conflict1 = hasConflict(
                task.teacherId,
                task.classId,
                slot1.day,
                slot1.period,
                schedule,
                globalSchedule,
                slot1.startTime,
                slot1.endTime
            );

            const conflict2 = hasConflict(
                task.teacherId,
                task.classId,
                slot2.day,
                slot2.period,
                schedule,
                globalSchedule,
                slot2.startTime,
                slot2.endTime
            );

            if (!conflict1 && !conflict2) {
                pairs.push({ slot1, slot2 });
            }
        }
    }

    if (pairs.length === 0) return false;

    // Group pairs by day
    const pairsByDay: Record<string, typeof pairs> = {};
    for (const p of pairs) {
        if (!pairsByDay[p.slot1.day]) pairsByDay[p.slot1.day] = [];
        pairsByDay[p.slot1.day].push(p);
    }

    // Try to pick a day where count < maxPerDay
    const days = Object.keys(pairsByDay).sort();
    for (const day of days) {
        const currentCount = getSubjectDayCount(task.subjectId, day);
        if (currentCount < maxPerDay && pairsByDay[day].length > 0) {
            const pair = pairsByDay[day][0];
            placeEntry(task, pair.slot1, schedule);
            placeEntry(task, pair.slot2, schedule);
            incrementSubjectDayCount(task.subjectId, day);
            return true;
        }
    }

    // Fallback: place anywhere
    const firstPair = pairs[0];
    placeEntry(task, firstPair.slot1, schedule);
    placeEntry(task, firstPair.slot2, schedule);
    incrementSubjectDayCount(task.subjectId, firstPair.slot1.day);
    return true;
}

/**
 * Place a single-period task with round-robin and per-day limit
 */
function placeSingleTask(
    task: PlacementTask,
    schedule: Map<string, ScheduleEntry>,
    allSlots: TimeSlot[],
    globalSchedule: Map<string, ScheduleEntry> | undefined,
    maxPerDay: number
): boolean {
    // Find all available slots
    const available: TimeSlot[] = [];

    for (const slot of allSlots) {
        const key = `${slot.day}-${slot.period}`;
        if (schedule.has(key)) continue;

        const conflict = hasConflict(
            task.teacherId,
            task.classId,
            slot.day,
            slot.period,
            schedule,
            globalSchedule,
            slot.startTime,
            slot.endTime
        );

        if (!conflict) {
            available.push(slot);
        }
    }

    if (available.length === 0) return false;

    // Group by day
    const slotsByDay: Record<string, TimeSlot[]> = {};
    for (const slot of available) {
        if (!slotsByDay[slot.day]) slotsByDay[slot.day] = [];
        slotsByDay[slot.day].push(slot);
    }

    // Try to pick a day where count < maxPerDay
    const days = Object.keys(slotsByDay).sort();
    for (const day of days) {
        const currentCount = getSubjectDayCount(task.subjectId, day);
        if (currentCount < maxPerDay && slotsByDay[day].length > 0) {
            const slot = slotsByDay[day][0];
            placeEntry(task, slot, schedule);
            incrementSubjectDayCount(task.subjectId, day);
            return true;
        }
    }

    // Fallback: place anywhere
    const firstSlot = available[0];
    placeEntry(task, firstSlot, schedule);
    incrementSubjectDayCount(task.subjectId, firstSlot.day);
    return true;
}

/**
 * Place an entry in the schedule
 */
function placeEntry(
    task: PlacementTask,
    slot: TimeSlot,
    schedule: Map<string, ScheduleEntry>
): void {
    const key = `${slot.day}-${slot.period}`;

    const entry: ScheduleEntry = {
        day: slot.day,
        period: slot.period,
        teacherId: task.teacherId,
        teacherName: task.teacherName,
        subjectId: task.subjectId,
        subjectName: task.subjectName,
        classId: task.classId,
        className: task.className,
        startTime: slot.startTime,
        endTime: slot.endTime
    };

    schedule.set(key, entry);
}

/**
 * Build all time slots correctly handling breaks
 */
function buildTimeSlots(config: any): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHour, startMin] = config.schoolStartTime.split(':').map(Number);
    const [endHour, endMin] = config.schoolEndTime.split(':').map(Number);

    const breaks = Array.isArray(config.breaks) ? config.breaks : [];

    const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const toTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const schoolStartMins = startHour * 60 + startMin;
    const schoolEndMins = endHour * 60 + endMin;
    const periodDuration = config.periodDuration;

    for (const day of WORKING_DAYS) {
        let currentMins = schoolStartMins;
        let periodCounter = 1;

        while (currentMins + periodDuration <= schoolEndMins) {
            // Check if current time is inside a break
            const activeBreak = breaks.find((b: any) => {
                const bStart = toMinutes(b.startTime);
                const bEnd = toMinutes(b.endTime);
                return currentMins >= bStart && currentMins < bEnd;
            });

            if (activeBreak) {
                currentMins = toMinutes(activeBreak.endTime);
                continue;
            }

            const slotStart = currentMins;
            const slotEnd = currentMins + periodDuration;

            // Check if slot ends inside a break
            const breakInterruption = breaks.find((b: any) => {
                const bStart = toMinutes(b.startTime);
                return slotStart < bStart && slotEnd > bStart;
            });

            if (breakInterruption) {
                currentMins = toMinutes(breakInterruption.endTime);
                continue;
            }

            slots.push({
                day,
                period: periodCounter,
                startTime: toTime(slotStart),
                endTime: toTime(slotEnd)
            });

            currentMins = slotEnd;
            periodCounter++;
        }
    }
    return slots;
}

/**
 * Fetch allocations for a specific class
 */
async function fetchAllocations(
    schoolId: string,
    classId: string
): Promise<Allocation[]> {
    const allocations = await prisma.teacherSubjectClass.findMany({
        where: {
            schoolId,
            classId,
            isActive: true
        },
        include: {
            teacher: true,
            subject: true,
            class: {
                include: {
                    level: true
                }
            }
        }
    });

    return allocations.map(a => ({
        id: a.id,
        teacherId: a.teacherId,
        teacherName: a.teacher.name,
        subjectId: a.subjectId,
        subjectName: a.subject.name,
        classId: a.classId,
        className: `${a.class.level.name} ${a.class.name}`,
        hoursPerWeek: a.hoursPerWeek || 1,
        requiresDoublePeriod: a.requiresDoublePeriod || false
    }));
}

/**
 * Convert schedule to JSON format for database storage
 */
export function convertScheduleToJson(schedule: ScheduleEntry[]): any {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const result: any = {};

    for (const day of days) {
        result[day] = schedule
            .filter(entry => entry.day === day)
            .sort((a, b) => a.period - b.period)
            .map(entry => ({
                period: entry.period,
                subject: entry.subjectName,
                teacher: entry.teacherName,
                subjectId: entry.subjectId,
                teacherId: entry.teacherId,
                startTime: entry.startTime,
                endTime: entry.endTime
            }));
    }

    return result;
}
