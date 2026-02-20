import { prisma } from '@/lib/db';

/**
 * Verify all timetables for conflicts
 * Checks if any teacher is assigned to multiple classes at the same time
 */
export async function verifyAllTimetables(schoolId: string, term: string) {
    console.log('\n🔍 VERIFYING ALL TIMETABLES FOR CONFLICTS...\n');
    console.log(`School ID: ${schoolId}`);
    console.log(`Term: ${term}\n`);

    // Fetch all timetables for this school and term
    const timetables = await prisma.timetable.findMany({
        where: {
            schoolId,
            term: term as any
        },
        include: {
            class: {
                include: {
                    level: true
                }
            }
        }
    });

    console.log(`📊 Total Timetables Found: ${timetables.length}\n`);

    if (timetables.length === 0) {
        console.log('⚠️ No timetables found. Generate timetables first.\n');
        return { hasConflicts: false, conflicts: [], summary: {} };
    }

    // Parse all schedules and create a global map
    const globalSchedule: Array<{
        className: string;
        day: string;
        period: number;
        startTime: string;
        endTime: string;
        teacherId: string;
        teacherName: string;
        subject: string;
    }> = [];

    for (const timetable of timetables) {
        const className = `${timetable.class.level.name} ${timetable.class.name}`;
        const schedule = timetable.schedule as any;

        for (const day of ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']) {
            const daySchedule = schedule[day] || [];

            for (const entry of daySchedule) {
                globalSchedule.push({
                    className,
                    day,
                    period: entry.period,
                    startTime: entry.startTime,
                    endTime: entry.endTime,
                    teacherId: entry.teacherId,
                    teacherName: entry.teacher,
                    subject: entry.subject
                });
            }
        }
    }

    console.log(`📋 Total Schedule Entries: ${globalSchedule.length}\n`);

    // Check for conflicts
    const conflicts: Array<{
        teacherName: string;
        teacherId: string;
        day: string;
        time: string;
        class1: string;
        subject1: string;
        class2: string;
        subject2: string;
    }> = [];

    for (let i = 0; i < globalSchedule.length; i++) {
        for (let j = i + 1; j < globalSchedule.length; j++) {
            const entry1 = globalSchedule[i];
            const entry2 = globalSchedule[j];

            // Check if same teacher, same day, and overlapping times
            if (
                entry1.teacherId === entry2.teacherId &&
                entry1.day === entry2.day &&
                timesOverlap(entry1.startTime, entry1.endTime, entry2.startTime, entry2.endTime)
            ) {
                conflicts.push({
                    teacherName: entry1.teacherName,
                    teacherId: entry1.teacherId,
                    day: entry1.day,
                    time: `${entry1.startTime}-${entry1.endTime}`,
                    class1: entry1.className,
                    subject1: entry1.subject,
                    class2: entry2.className,
                    subject2: entry2.subject
                });
            }
        }
    }

    // Print results
    if (conflicts.length === 0) {
        console.log('✅ NO CONFLICTS FOUND!\n');
        console.log('All teachers are properly scheduled without overlaps.\n');
    } else {
        console.log(`❌ CONFLICTS FOUND: ${conflicts.length}\n`);
        console.log('═══════════════════════════════════════════════════════════\n');

        conflicts.forEach((conflict, index) => {
            console.log(`Conflict #${index + 1}:`);
            console.log(`  Teacher: ${conflict.teacherName} (${conflict.teacherId})`);
            console.log(`  Day: ${conflict.day}`);
            console.log(`  Time: ${conflict.time}`);
            console.log(`  Class 1: ${conflict.class1} - ${conflict.subject1}`);
            console.log(`  Class 2: ${conflict.class2} - ${conflict.subject2}`);
            console.log('───────────────────────────────────────────────────────────\n');
        });
    }

    // Generate summary statistics
    const teacherStats = new Map<string, { name: string; classes: Set<string>; totalPeriods: number }>();

    for (const entry of globalSchedule) {
        if (!teacherStats.has(entry.teacherId)) {
            teacherStats.set(entry.teacherId, {
                name: entry.teacherName,
                classes: new Set(),
                totalPeriods: 0
            });
        }
        const stats = teacherStats.get(entry.teacherId)!;
        stats.classes.add(entry.className);
        stats.totalPeriods++;
    }

    console.log('📈 TEACHER WORKLOAD SUMMARY:\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const sortedTeachers = Array.from(teacherStats.entries())
        .sort((a, b) => b[1].totalPeriods - a[1].totalPeriods);

    for (const [teacherId, stats] of sortedTeachers) {
        console.log(`${stats.name}:`);
        console.log(`  Classes: ${stats.classes.size}`);
        console.log(`  Total Periods/Week: ${stats.totalPeriods}`);
        console.log(`  Classes: ${Array.from(stats.classes).join(', ')}`);
        console.log('───────────────────────────────────────────────────────────\n');
    }

    return {
        hasConflicts: conflicts.length > 0,
        conflicts,
        summary: {
            totalTimetables: timetables.length,
            totalEntries: globalSchedule.length,
            totalConflicts: conflicts.length,
            teacherCount: teacherStats.size
        }
    };
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
    const toMinutes = (time: string) => {
        const [hours, mins] = time.split(':').map(Number);
        return hours * 60 + mins;
    };

    const s1 = toMinutes(start1);
    const e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    const e2 = toMinutes(end2);

    return s1 < e2 && s2 < e1;
}
