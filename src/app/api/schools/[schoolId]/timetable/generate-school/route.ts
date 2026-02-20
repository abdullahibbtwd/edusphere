import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hasConflict, type ScheduleEntry } from '@/lib/timetable/conflict-checker';
import { convertScheduleToJson } from '@/lib/timetable/generator';

type TimeSlot = {
    day: string;
    period: number;
    startTime: string;
    endTime: string;
};

type SubjectWithOccurrences = {
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    classId: string;
    className: string;
    levelId: string;
    requiresDoublePeriod: boolean;
    requiredOccurrences: number;
};

type PlacementTask = SubjectWithOccurrences & {
    occurrenceIndex: number;
    isDouble: boolean; // Override for this specific task
};

const WORKING_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

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
 * Compute required occurrences for each subject in a class
 */
function computeOccurrences(
    allocations: any[],
    totalPeriods: number,
    classId: string,
    className: string,
    levelId: string
): SubjectWithOccurrences[] {
    const subjects: SubjectWithOccurrences[] = allocations.map(a => ({
        subjectId: a.subjectId,
        subjectName: a.subject.name,
        teacherId: a.teacherId,
        teacherName: a.teacher.name,
        classId,
        className,
        levelId,
        requiresDoublePeriod: a.requiresDoublePeriod || false,
        requiredOccurrences: 0
    }));

    // CRITICAL FIX: Account for mixed doubles and singles
    // For double-period subjects, we create max 2 doubles, rest singles
    // So effective weight = (2 doubles × 2 periods) + (remaining × 1 period)

    let totalWeight = 0;
    for (const s of subjects) {
        if (s.requiresDoublePeriod) {
            // Assume this subject will have some occurrences
            // Strategy: 2 doubles + remaining singles
            // For now, estimate weight as 1.5 (between 1 and 2)
            totalWeight += 1.5;
        } else {
            totalWeight += 1;
        }
    }

    const baseOccurrences = Math.floor(totalPeriods / totalWeight);
    let remainder = totalPeriods % totalWeight;

    // Assign base occurrences
    subjects.forEach(s => {
        s.requiredOccurrences = baseOccurrences;
    });

    // Distribute remainder, prioritizing double-period subjects
    const doubleSubjects = subjects.filter(s => s.requiresDoublePeriod);
    const singleSubjects = subjects.filter(s => !s.requiresDoublePeriod);
    const orderedSubjects = [...doubleSubjects, ...singleSubjects];

    let i = 0;
    while (remainder > 0.5) {
        const s = orderedSubjects[i % orderedSubjects.length];
        s.requiredOccurrences += 1;

        if (s.requiresDoublePeriod) {
            remainder -= 1.5;
        } else {
            remainder -= 1;
        }
        i++;

        if (i > orderedSubjects.length * 5) break; // Safety
    }

    return subjects;
}


/**
 * Place a double-period task
 */
function placeDoubleTask(
    task: PlacementTask,
    globalSchedule: Map<string, ScheduleEntry>,
    busyTeachers: Map<string, Set<string>>,
    allSlots: TimeSlot[],
    maxPerDay: number,
    subjectDayCount: Map<string, Map<string, number>>,
    classDayLoad: Map<string, Map<string, number>>,
    relaxed: boolean = false
): boolean {
    const pairs: { slot1: TimeSlot; slot2: TimeSlot }[] = [];

    for (let i = 0; i < allSlots.length - 1; i++) {
        const s1 = allSlots[i];
        const s2 = allSlots[i + 1];

        if (s1.day !== s2.day || s2.period !== s1.period + 1) continue;

        const conflict1 = hasConflict(task.teacherId, task.classId, s1.day, s1.period, globalSchedule, busyTeachers);
        const conflict2 = hasConflict(task.teacherId, task.classId, s2.day, s2.period, globalSchedule, busyTeachers);

        if (!conflict1 && !conflict2) {
            pairs.push({ slot1: s1, slot2: s2 });
        }
    }

    if (pairs.length === 0) return false;

    const getCount = (day: string) => subjectDayCount.get(`${task.classId}-${task.subjectId}`)?.get(day) || 0;
    const getLoad = (day: string) => classDayLoad.get(task.classId)?.get(day) || 0;

    const days = Object.keys(
        pairs.reduce((acc, p) => ({ ...acc, [p.slot1.day]: true }), {})
    ).sort((a, b) => {
        const cA = getCount(a);
        const cB = getCount(b);
        if (cA !== cB) return cA - cB;
        return getLoad(a) - getLoad(b) || Math.random() - 0.5;
    });

    for (const day of days) {
        if (relaxed || getCount(day) < maxPerDay) {
            const dayPairs = pairs.filter(p => p.slot1.day === day);
            const pair = dayPairs[Math.floor(Math.random() * dayPairs.length)];

            placeEntry(task, pair.slot1, globalSchedule, busyTeachers);
            placeEntry(task, pair.slot2, globalSchedule, busyTeachers);

            const key = `${task.classId}-${task.subjectId}`;
            if (!subjectDayCount.has(key)) subjectDayCount.set(key, new Map());
            subjectDayCount.get(key)!.set(day, getCount(day) + 1);

            if (!classDayLoad.has(task.classId)) classDayLoad.set(task.classId, new Map());
            classDayLoad.get(task.classId)!.set(day, getLoad(day) + 2);
            return true;
        }
    }

    return false;
}

/**
 * Place a single-period task
 */
function placeSingleTask(
    task: PlacementTask,
    globalSchedule: Map<string, ScheduleEntry>,
    busyTeachers: Map<string, Set<string>>,
    allSlots: TimeSlot[],
    maxPerDay: number,
    subjectDayCount: Map<string, Map<string, number>>,
    classDayLoad: Map<string, Map<string, number>>,
    relaxed: boolean = false
): boolean {
    const available = allSlots.filter(s => !hasConflict(task.teacherId, task.classId, s.day, s.period, globalSchedule, busyTeachers));

    if (available.length === 0) return false;

    const getCount = (day: string) => subjectDayCount.get(`${task.classId}-${task.subjectId}`)?.get(day) || 0;
    const getLoad = (day: string) => classDayLoad.get(task.classId)?.get(day) || 0;

    const days = Object.keys(
        available.reduce((acc, s) => ({ ...acc, [s.day]: true }), {})
    ).sort((a, b) => {
        const cA = getCount(a);
        const cB = getCount(b);
        if (cA !== cB) return cA - cB;
        return getLoad(a) - getLoad(b) || Math.random() - 0.5;
    });

    for (const day of days) {
        if (relaxed || getCount(day) < maxPerDay) {
            const daySlots = available.filter(s => s.day === day);
            const slot = daySlots[Math.floor(Math.random() * daySlots.length)];

            placeEntry(task, slot, globalSchedule, busyTeachers);

            const key = `${task.classId}-${task.subjectId}`;
            if (!subjectDayCount.has(key)) subjectDayCount.set(key, new Map());
            subjectDayCount.get(key)!.set(day, getCount(day) + 1);

            if (!classDayLoad.has(task.classId)) classDayLoad.set(task.classId, new Map());
            classDayLoad.get(task.classId)!.set(day, getLoad(day) + 1);
            return true;
        }
    }

    return false;
}

/**
 * Place an entry in the global schedule
 */
function placeEntry(
    task: PlacementTask,
    slot: TimeSlot,
    globalSchedule: Map<string, ScheduleEntry>,
    busyTeachers: Map<string, Set<string>>
): void {
    const key = `${task.classId}-${slot.day}-${slot.period}`;
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

    globalSchedule.set(key, entry);

    const teacherKey = `${slot.day}-${slot.period}`;
    if (!busyTeachers.has(teacherKey)) busyTeachers.set(teacherKey, new Set());
    busyTeachers.get(teacherKey)!.add(task.teacherId);
}

/**
 * Solve the global scheduling problem
 */
function solveGlobal(
    tasks: PlacementTask[],
    allSlots: TimeSlot[],
    globalSchedule: Map<string, ScheduleEntry>,
    busyTeachers: Map<string, Set<string>>,
    subjectDayCount: Map<string, Map<string, number>>,
    classDayLoad: Map<string, Map<string, number>>,
    relaxed: boolean = false
): boolean {
    let failedTasks: PlacementTask[] = [];

    for (const task of tasks) {
        const maxPerDay = relaxed ? 99 : Math.max(1, Math.ceil(task.requiredOccurrences / 5));
        let placed = false;

        if (task.isDouble) {
            placed = placeDoubleTask(task, globalSchedule, busyTeachers, allSlots, maxPerDay, subjectDayCount, classDayLoad, relaxed);
        } else {
            placed = placeSingleTask(task, globalSchedule, busyTeachers, allSlots, maxPerDay, subjectDayCount, classDayLoad, relaxed);
        }

        if (!placed) failedTasks.push(task);
    }

    return failedTasks.length === 0;
}

/**
 * Resolve school ID from subdomain or UUID
 */
async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
    let school = await prisma.school.findUnique({
        where: { id: schoolIdentifier },
        select: { id: true }
    });

    if (!school) {
        school = await prisma.school.findUnique({
            where: {
                subdomain: schoolIdentifier,
                isActive: true
            },
            select: { id: true }
        });
    }

    return school?.id || null;
}

/**
 * Generate timetables for ALL classes using global task-based scheduler
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: schoolIdentifier } = await params;

        // Role-based access control
        const sessionCookie = request.cookies.get('user-session');
        if (!sessionCookie) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = JSON.parse(decodeURIComponent(sessionCookie.value));
        if (user.role.toLowerCase() !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Only admins can generate school-wide timetables' }, { status: 403 });
        }

        const body = await request.json();
        const { term } = body;

        if (!term) {
            return NextResponse.json({ error: 'Missing term' }, { status: 400 });
        }

        const schoolId = await resolveSchoolId(schoolIdentifier);
        if (!schoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        // Fetch config
        const config = await prisma.timetableConfig.findUnique({ where: { schoolId } });
        if (!config) {
            return NextResponse.json({ error: 'Timetable configuration not found' }, { status: 404 });
        }

        // Build all time slots
        const allSlots = buildTimeSlots(config);
        const totalPeriods = allSlots.length;

        // Fetch ALL allocations for the entire school
        const allAllocations = await prisma.teacherSubjectClass.findMany({
            where: { schoolId, isActive: true },
            include: {
                teacher: true,
                subject: true,
                class: { include: { level: true } }
            }
        });

        // Get all classes
        const classes = await prisma.class.findMany({
            where: { schoolId },
            include: { level: true }
        });

        if (classes.length === 0) {
            return NextResponse.json({ error: 'No classes found' }, { status: 404 });
        }

        // Compute global teacher load
        const globalTeacherLoad = new Map<string, number>();
        for (const alloc of allAllocations) {
            const current = globalTeacherLoad.get(alloc.teacherId) || 0;
            globalTeacherLoad.set(alloc.teacherId, current + (alloc.hoursPerWeek || 1));
        }

        // Group allocations by class & compute occurrences
        const allocationsByClass = new Map<string, typeof allAllocations>();
        for (const alloc of allAllocations) {
            if (!allocationsByClass.has(alloc.classId)) {
                allocationsByClass.set(alloc.classId, []);
            }
            allocationsByClass.get(alloc.classId)!.push(alloc);
        }

        const classData: {
            classId: string;
            className: string;
            levelId: string;
            subjects: SubjectWithOccurrences[];
            doubleCount: number;
            teacherLoadSum: number;
        }[] = [];

        for (const classItem of classes) {
            const allocs = allocationsByClass.get(classItem.id) || [];
            if (allocs.length === 0) continue;

            const className = `${classItem.level.name} ${classItem.name}`;
            const subjects = computeOccurrences(allocs, totalPeriods, classItem.id, className, classItem.levelId);

            const doubleCount = subjects.filter(s => s.requiresDoublePeriod).length;
            const teacherLoadSum = subjects.reduce((sum, s) => sum + (globalTeacherLoad.get(s.teacherId) || 0), 0);

            classData.push({
                classId: classItem.id,
                className,
                levelId: classItem.levelId,
                subjects,
                doubleCount,
                teacherLoadSum
            });
        }

        // Sort classes by difficulty
        classData.sort((a, b) => {
            if (a.doubleCount !== b.doubleCount) return b.doubleCount - a.doubleCount;
            return b.teacherLoadSum - a.teacherLoadSum;
        });

        // Create global task list with intelligent double/single mix
        const globalTasks: PlacementTask[] = [];
        for (const c of classData) {
            for (const s of c.subjects) {
                if (s.requiresDoublePeriod) {
                    // For double-period subjects: Create a mix of doubles and singles
                    // Strategy: 1-2 double periods, rest as singles
                    const totalOccurrences = s.requiredOccurrences;
                    const doubleOccurrences = Math.min(2, Math.floor(totalOccurrences / 2)); // Max 2 doubles
                    const singleOccurrences = totalOccurrences - doubleOccurrences;

                    // Create double tasks first (higher priority)
                    for (let i = 0; i < doubleOccurrences; i++) {
                        globalTasks.push({
                            ...s,
                            occurrenceIndex: i,
                            isDouble: true // Keep as double
                        });
                    }

                    // Create single tasks for the rest
                    for (let i = 0; i < singleOccurrences; i++) {
                        globalTasks.push({
                            ...s,
                            occurrenceIndex: doubleOccurrences + i,
                            isDouble: false // Override to single
                        });
                    }
                } else {
                    // For single-period subjects: All occurrences are single
                    for (let i = 0; i < s.requiredOccurrences; i++) {
                        globalTasks.push({
                            ...s,
                            occurrenceIndex: i,
                            isDouble: false
                        });
                    }
                }
            }
        }

        // Sort tasks: double first, then by teacher load
        globalTasks.sort((a, b) => {
            if (a.isDouble && !b.isDouble) return -1;
            if (!a.isDouble && b.isDouble) return 1;
            const loadA = globalTeacherLoad.get(a.teacherId) || 0;
            const loadB = globalTeacherLoad.get(b.teacherId) || 0;
            return loadB - loadA;
        });

        // Diagnostic logging
        console.log(`\n🎯 Scheduling Problem Overview:`);
        console.log(`  Total available slots: ${allSlots.length}`);
        console.log(`  Total classes: ${classData.length}`);
        console.log(`  Total tasks to place: ${globalTasks.length}`);
        console.log(`  Double-period tasks: ${globalTasks.filter(t => t.isDouble).length}`);
        console.log(`  Single-period tasks: ${globalTasks.filter(t => !t.isDouble).length}`);

        // Calculate total periods needed
        const totalPeriodsNeeded = globalTasks.reduce((sum, t) => {
            return sum + (t.isDouble ? 2 : 1);
        }, 0);
        console.log(`  Total periods needed: ${totalPeriodsNeeded}`);
        console.log(`  Periods available per class: ${totalPeriods}`);
        console.log(`  Total periods available across all classes: ${totalPeriods * classData.length}`);

        if (totalPeriodsNeeded > totalPeriods * classData.length) {
            console.error(`❌ IMPOSSIBLE: Need ${totalPeriodsNeeded} periods but only have ${totalPeriods * classData.length} available!`);
        }

        // Try to solve with retry
        let success = false;
        const globalSchedule = new Map<string, ScheduleEntry>();
        const bestAttempt = { placed: 0, schedule: new Map<string, ScheduleEntry>() };

        const MAX_ATTEMPTS = 200;
        const RELAXED_START = 100;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            globalSchedule.clear();
            const busyTeachers = new Map<string, Set<string>>();
            const subjectDayCount = new Map<string, Map<string, number>>();
            const classDayLoad = new Map<string, Map<string, number>>();

            const isRelaxed = attempt >= RELAXED_START;
            if (attempt === RELAXED_START) {
                console.log(`⚠️ Switching to RELAXED mode after ${RELAXED_START} failed strict attempts.`);
            }

            const shuffled = [...globalTasks].sort(() => Math.random() - 0.5);
            shuffled.sort((a, b) => {
                if (a.isDouble && !b.isDouble) return -1;
                if (!a.isDouble && b.isDouble) return 1;
                return (globalTeacherLoad.get(b.teacherId) || 0) - (globalTeacherLoad.get(a.teacherId) || 0) || Math.random() - 0.5;
            });

            const result = solveGlobal(shuffled, allSlots, globalSchedule, busyTeachers, subjectDayCount, classDayLoad, isRelaxed);

            if (globalSchedule.size > bestAttempt.placed) {
                bestAttempt.placed = globalSchedule.size;
                bestAttempt.schedule = new Map(globalSchedule);
            }

            if (result) {
                success = true;
                console.log(`✅ Successfully generated timetable on attempt ${attempt + 1} (Relaxed: ${isRelaxed})`);
                break;
            } else if (attempt % 20 === 0 || attempt === MAX_ATTEMPTS - 1) {
                const totalPlacements = globalTasks.reduce((sum, t) => sum + (t.isDouble ? 2 : 1), 0);
                const rate = (globalSchedule.size / totalPlacements) * 100;
                console.log(`❌ Attempt ${attempt + 1} failed (${rate.toFixed(1)}% periods filled)`);
            }
        }

        if (!success && bestAttempt.placed >= totalPeriodsNeeded * 0.98) {
            console.log(`⚠️ Using best attempt (${((bestAttempt.placed / totalPeriodsNeeded) * 100).toFixed(1)}%)`);
            globalSchedule.clear();
            bestAttempt.schedule.forEach((v, k) => globalSchedule.set(k, v));
            success = true;
        }

        if (!success) {
            return NextResponse.json(
                { error: `Could not generate complete timetable. Best attempt: ${bestAttempt.placed}/${globalTasks.length} tasks placed. Try reducing subjects per class or increasing school hours.` },
                { status: 500 }
            );
        }

        // Group results by class and save
        const timetablesByClass = new Map<string, ScheduleEntry[]>();
        for (const entry of globalSchedule.values()) {
            if (!timetablesByClass.has(entry.classId)) {
                timetablesByClass.set(entry.classId, []);
            }
            timetablesByClass.get(entry.classId)!.push(entry);
        }

        const results = [];
        for (const [classId, entries] of timetablesByClass) {
            const classInfo = classData.find(c => c.classId === classId)!;
            const scheduleJson = convertScheduleToJson(entries);

            await prisma.timetable.upsert({
                where: {
                    classId_term_schoolId: {
                        classId,
                        term: term as any,
                        schoolId
                    }
                },
                update: {
                    schedule: scheduleJson,
                    updatedAt: new Date()
                },
                create: {
                    classId,
                    levelId: classInfo.levelId,
                    term: term as any,
                    schedule: scheduleJson,
                    schoolId
                }
            });

            results.push({
                classId,
                className: classInfo.className,
                periodsGenerated: entries.length,
                success: true
            });
        }

        return NextResponse.json({
            success: true,
            totalClasses: classData.length,
            successful: results.length,
            failed: 0,
            results
        });

    } catch (error: any) {
        console.error('School-wide timetable generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate timetables' },
            { status: 500 }
        );
    }
}
