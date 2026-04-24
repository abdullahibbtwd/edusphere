import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';
import { requireRole } from '@/lib/auth-middleware';
import { Term } from '@prisma/client';

type TimeSlotDef = { startTime: string; endTime: string };

function buildDaySlots(examStartTime: string, examDuration: number, breakBetweenExams: number, examsPerDay: number): TimeSlotDef[] {
    const slots: TimeSlotDef[] = [];
    const [h, m] = examStartTime.split(':').map(Number);
    let current = h * 60 + m;
    for (let i = 0; i < examsPerDay; i++) {
        const start = current;
        const end = current + examDuration;
        slots.push({
            startTime: `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`,
            endTime: `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`,
        });
        current = end + breakBetweenExams;
    }
    return slots;
}

/** Get all weekdays (Mon-Fri) within a date range, inclusive */
function getWeekdaysInRange(startDate: Date, endDate: Date): Date[] {
    const days: Date[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    while (current <= end) {
        const dow = current.getDay();
        if (dow >= 1 && dow <= 5) {
            days.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
    }
    return days;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    const sessionUser = requireRole(req, ['ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    try {
        const { schoolId: identifier } = await params;
        const resolvedSchool = await getSchool(identifier);
        if (!resolvedSchool) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        const schoolId = resolvedSchool.id;
        if (sessionUser.schoolId && sessionUser.schoolId !== schoolId) {
            return NextResponse.json(
                { error: 'Forbidden - You can only generate exam timetable for your school' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { term } = body;
        if (!term) return NextResponse.json({ error: 'Missing term' }, { status: 400 });
        if (!(Object.values(Term) as string[]).includes(term)) {
            return NextResponse.json({ error: 'Invalid term value' }, { status: 400 });
        }

        // 1. Load exam config
        const config = await prisma.examTimetableConfig.findUnique({ where: { schoolId } });
        if (!config) return NextResponse.json({ error: 'Exam configuration not found. Please set it up first.' }, { status: 404 });

        const { examsPerDay, examDuration, breakBetweenExams, examStartTime } = config;
        const daySlots = buildDaySlots(examStartTime, examDuration, breakBetweenExams, examsPerDay);

        // 2. Find exam weeks for this term from AcademicEvents
        const activeSession = await prisma.academicSession.findFirst({
            where: { schoolId, isActive: true },
            include: {
                terms: {
                    where: { name: term as any },
                    include: { events: { where: { type: 'EXAM' } } },
                },
            },
        });

        const termData = activeSession?.terms?.[0];
        if (!termData) return NextResponse.json({ error: 'No active term found for the selected term.' }, { status: 404 });

        const examEvents = termData.events;
        if (!examEvents || examEvents.length === 0) {
            return NextResponse.json({
                error: 'No exam weeks defined in the calendar for this term. Please mark exam weeks in the academic calendar first.',
            }, { status: 400 });
        }

        // 3. Collect all weekdays across exam event periods
        const examDays: Date[] = [];
        for (const event of examEvents) {
            const days = getWeekdaysInRange(event.startDate, event.endDate);
            examDays.push(...days);
        }
        // Deduplicate and sort
        const uniqueDays = Array.from(
            new Map(examDays.map(d => [d.toISOString().split('T')[0], d])).values()
        ).sort((a, b) => a.getTime() - b.getTime());

        // 4. Build flat list of (date, slotIndex, startTime, endTime)
        const availableSlots: { date: Date; slotIndex: number; startTime: string; endTime: string }[] = [];
        for (const day of uniqueDays) {
            for (let i = 0; i < daySlots.length; i++) {
                availableSlots.push({ date: day, slotIndex: i, startTime: daySlots[i].startTime, endTime: daySlots[i].endTime });
            }
        }

        if (availableSlots.length === 0) {
            return NextResponse.json({ error: 'No exam slots available. Check exam weeks in the calendar.' }, { status: 400 });
        }

        // 5. Get all TeacherSubjectClass entries for the school
        const allocations = await prisma.teacherSubjectClass.findMany({
            where: { schoolId, isActive: true },
            include: {
                subject: true,
                teacher: true,
                class: { include: { level: true } },
            },
        });

        // Filter allocations to only subjects belonging to this term (or FULL_SESSION)
        const termAllocations = allocations.filter(
            a => a.subject.term === term || a.subject.term === 'FULL_SESSION'
        );

        if (termAllocations.length === 0) {
            return NextResponse.json({ error: 'No subjects found for this term. Assign subjects to classes first.' }, { status: 400 });
        }

        // 6. Group allocations by levelId → set of unique subjectIds
        const levelSubjectMap = new Map<string, Set<string>>(); // levelId → Set<subjectId>
        const levelClassMap = new Map<string, Set<string>>(); // levelId → Set<classId>

        for (const alloc of termAllocations) {
            const levelId = alloc.class.levelId;
            if (!levelSubjectMap.has(levelId)) levelSubjectMap.set(levelId, new Set());
            levelSubjectMap.get(levelId)!.add(alloc.subjectId);
            if (!levelClassMap.has(levelId)) levelClassMap.set(levelId, new Set());
            levelClassMap.get(levelId)!.add(alloc.classId);
        }

        // 7. Assign subjects to slots per level (conflict-free: same level can't have 2 exams at same slot)
        // Strategy: round-robin across levels to balance slot usage
        type ExamAssignment = {
            levelId: string;
            subjectId: string;
            slotIndex: number; // index into availableSlots
        };

        const levelAssignments = new Map<string, ExamAssignment[]>();
        // slotUsage[slotIndex] = Set of levelIds using this slot
        const slotUsageByLevel = new Map<number, Set<string>>();

        for (const [levelId, subjects] of levelSubjectMap.entries()) {
            const subjectList = Array.from(subjects);
            const assignments: ExamAssignment[] = [];
            let slotCursor = 0;

            for (const subjectId of subjectList) {
                // Find next available slot for this level
                while (slotCursor < availableSlots.length) {
                    const usage = slotUsageByLevel.get(slotCursor) || new Set();
                    if (!usage.has(levelId)) break;
                    slotCursor++;
                }

                if (slotCursor >= availableSlots.length) {
                    console.warn(`Not enough exam slots for level ${levelId} — ${subjectList.length} subjects but only ${availableSlots.length} slots`);
                    break;
                }

                assignments.push({ levelId, subjectId, slotIndex: slotCursor });
                if (!slotUsageByLevel.has(slotCursor)) slotUsageByLevel.set(slotCursor, new Set());
                slotUsageByLevel.get(slotCursor)!.add(levelId);
                slotCursor++;
            }

            levelAssignments.set(levelId, assignments);
        }

        // 8. Invigilator assignment

        // Get all teachers for the school
        const allTeachers = await prisma.teacher.findMany({
            where: { schoolId },
            select: { id: true, name: true },
        });

        // teacherSubjectLookup: teacherId → Set<subjectId>
        // A teacher may not invigilate ANY exam for a subject they teach (in any class).
        const teacherSubjectLookup = new Map<string, Set<string>>();
        for (const alloc of termAllocations) {
            if (!teacherSubjectLookup.has(alloc.teacherId)) {
                teacherSubjectLookup.set(alloc.teacherId, new Set());
            }
            teacherSubjectLookup.get(alloc.teacherId)!.add(alloc.subjectId);
        }

        // busyTeachers[slotIndex] = Set<teacherId> — teachers occupied in that slot (as teacher OR invigilator)
        const busyTeachers = new Map<number, Set<string>>();

        // invigilatorCount: teacherId → number of invigilator duties assigned (for fair distribution)
        const invigilatorCount = new Map<string, number>();
        for (const t of allTeachers) invigilatorCount.set(t.id, 0);

        function markBusy(slotIndex: number, teacherId: string) {
            if (!busyTeachers.has(slotIndex)) busyTeachers.set(slotIndex, new Set());
            busyTeachers.get(slotIndex)!.add(teacherId);
        }

        // Pick invigilator: prefer teacher with fewest duties, not teaching the subject, not busy in slot
        function pickInvigilator(subjectId: string, slotIndex: number): string | null {
            const busy = busyTeachers.get(slotIndex) || new Set();
            const candidates = allTeachers.filter(t => {
                if (busy.has(t.id)) return false;
                const subjects = teacherSubjectLookup.get(t.id) || new Set();
                if (subjects.has(subjectId)) return false; // teaches this subject
                return true;
            });
            if (candidates.length === 0) return null;
            // Pick the one with the fewest invigilator assignments so far
            candidates.sort((a, b) => (invigilatorCount.get(a.id) ?? 0) - (invigilatorCount.get(b.id) ?? 0));
            return candidates[0].id;
        }

        // 9. Build exam records to create
        type ExamRecord = {
            subjectId: string;
            teacherId: string;
            invigilatorId: string | null;
            examHall: string; // kept in schema but unused — stored as empty string
            date: Date;
            startTime: Date;
            endTime: Date;
            term: string;
            classId: string;
            levelId: string;
            schoolId: string;
        };

        const examRecords: ExamRecord[] = [];

        for (const [levelId, assignments] of levelAssignments.entries()) {
            const classes = Array.from(levelClassMap.get(levelId) || []);

            for (const assignment of assignments) {
                const slot = availableSlots[assignment.slotIndex];
                const { subjectId, slotIndex } = assignment;

                // Build Date objects for startTime and endTime using the slot date
                const parseTimeOnDate = (dateObj: Date, timeStr: string): Date => {
                    const [h, m] = timeStr.split(':').map(Number);
                    const d = new Date(dateObj);
                    d.setHours(h, m, 0, 0);
                    return d;
                };

                for (const classId of classes) {
                    // Find teacher for this subject-class
                    const alloc = termAllocations.find(a => a.subjectId === subjectId && a.classId === classId);
                    if (!alloc) continue; // subject not assigned to this class

                    // Mark the subject teacher as busy in this slot so they can't also invigilate
                    markBusy(slotIndex, alloc.teacherId);

                    const invigilatorId = pickInvigilator(subjectId, slotIndex);
                    if (invigilatorId) {
                        markBusy(slotIndex, invigilatorId);
                        invigilatorCount.set(invigilatorId, (invigilatorCount.get(invigilatorId) ?? 0) + 1);
                    }

                    examRecords.push({
                        subjectId,
                        teacherId: alloc.teacherId,
                        invigilatorId,
                        examHall: '',
                        date: slot.date,
                        startTime: parseTimeOnDate(slot.date, slot.startTime),
                        endTime: parseTimeOnDate(slot.date, slot.endTime),
                        term,
                        classId,
                        levelId,
                        schoolId,
                    });
                }
            }
        }

        if (examRecords.length === 0) {
            return NextResponse.json({ error: 'Could not generate any exam records. Ensure subjects and teachers are assigned.' }, { status: 400 });
        }

        // 10. Save: delete existing for this term then create all new records
        await prisma.$transaction(async (tx) => {
            await tx.examTimetable.deleteMany({ where: { schoolId, term: term as any } });
            await tx.examTimetable.createMany({
                data: examRecords.map(r => ({
                    subjectId: r.subjectId,
                    teacherId: r.teacherId,
                    invigilatorId: r.invigilatorId,
                    examHall: r.examHall,
                    date: r.date,
                    startTime: r.startTime,
                    endTime: r.endTime,
                    term: r.term as any,
                    classId: r.classId,
                    levelId: r.levelId,
                    schoolId: r.schoolId,
                })),
            });
        });

        return NextResponse.json({
            success: true,
            totalExams: examRecords.length,
            examDays: uniqueDays.length,
            message: `Generated ${examRecords.length} exam entries across ${uniqueDays.length} exam days.`,
        });
    } catch (error: any) {
        console.error('Exam timetable generation error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate exam timetable' }, { status: 500 });
    }
}
