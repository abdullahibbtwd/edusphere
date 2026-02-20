import { prisma } from '@/lib/db';

export type TimeSlot = {
    day: string; // "MONDAY", "TUESDAY", etc.
    period: number; // 1-8
};

export type Conflict = {
    type: 'TEACHER_BUSY' | 'CLASS_BUSY' | 'SUBJECT_DENSITY';
    message: string;
};

export type ScheduleEntry = {
    day: string;
    period: number;
    teacherId: string;
    teacherName: string;
    subjectId: string;
    subjectName: string;
    classId: string;
    className: string;
    startTime?: string;
    endTime?: string;
};

/**
 * Check if a teacher or class is busy at a specific time slot
 */
export function hasConflict(
    teacherId: string,
    classId: string,
    day: string,
    period: number,
    globalSchedule: Map<string, ScheduleEntry>,
    busyTeachers: Map<string, Set<string>>
): Conflict | null {
    // Check 1: Class Clash (is this slot already filled for this class?)
    const slotKey = `${classId}-${day}-${period}`;
    if (globalSchedule.has(slotKey)) {
        const entry = globalSchedule.get(slotKey)!;
        return {
            type: 'CLASS_BUSY',
            message: `Class is already scheduled for ${entry.subjectName} at ${day} Period ${period}`
        };
    }

    // Check 2: Teacher Clash (is the teacher busy in ANY class at this time?)
    const teacherKey = `${day}-${period}`;
    if (busyTeachers.get(teacherKey)?.has(teacherId)) {
        return {
            type: 'TEACHER_BUSY',
            message: `Teacher is already teaching another class at ${day} Period ${period}`
        };
    }

    return null; // No conflict
}

/**
 * Check if two time ranges overlap
 */
function timesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
): boolean {
    // Convert times to minutes for comparison
    const toMinutes = (time: string) => {
        const [hours, mins] = time.split(':').map(Number);
        return hours * 60 + mins;
    };

    const s1 = toMinutes(start1);
    const e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    const e2 = toMinutes(end2);

    // Check if ranges overlap
    return s1 < e2 && s2 < e1;
}

/**
 * Check if consecutive periods are available (for double periods)
 */
export function hasConsecutiveSlotsAvailable(
    teacherId: string,
    classId: string,
    day: string,
    startPeriod: number,
    totalPeriods: number,
    existingSchedule: Map<string, ScheduleEntry>,
    globalSchedule?: Map<string, ScheduleEntry>,
    config?: any
): boolean {
    // Check if we have room for 2 consecutive periods
    if (startPeriod + 1 > totalPeriods) return false;

    // Calculate times for both periods if config is provided
    let time1, time2;
    if (config) {
        time1 = calculatePeriodTime(startPeriod, config);
        time2 = calculatePeriodTime(startPeriod + 1, config);
    }

    const slot1Conflict = hasConflict(
        teacherId,
        classId,
        day,
        startPeriod,
        existingSchedule,
        globalSchedule,
        time1?.startTime,
        time1?.endTime
    );
    const slot2Conflict = hasConflict(
        teacherId,
        classId,
        day,
        startPeriod + 1,
        existingSchedule,
        globalSchedule,
        time2?.startTime,
        time2?.endTime
    );

    return !slot1Conflict && !slot2Conflict;
}

/**
 * Calculate time for a period based on config
 */
export function calculatePeriodTime(
    period: number,
    config: {
        schoolStartTime: string;
        periodDuration: number;
        breaks: Array<{ startTime: string; endTime: string; name: string }>;
    }
): { startTime: string; endTime: string } {
    const [startHour, startMin] = config.schoolStartTime.split(':').map(Number);
    let currentMinutes = startHour * 60 + startMin;

    // Add time for previous periods
    for (let p = 1; p < period; p++) {
        currentMinutes += config.periodDuration;

        // Check if there's a break after this period
        const periodEndTime = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;

        for (const brk of config.breaks) {
            // If break starts around this time, add break duration
            if (brk.startTime <= periodEndTime && periodEndTime < brk.endTime) {
                const [bStartH, bStartM] = brk.startTime.split(':').map(Number);
                const [bEndH, bEndM] = brk.endTime.split(':').map(Number);
                const breakDuration = (bEndH * 60 + bEndM) - (bStartH * 60 + bStartM);
                currentMinutes += breakDuration;
            }
        }
    }

    const startTime = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;
    currentMinutes += config.periodDuration;
    const endTime = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;

    return { startTime, endTime };
}
