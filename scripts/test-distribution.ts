
// Mock types
type TimeSlot = { day: string; period: number; };
type ScheduleEntry = { day: string; period: number; subjectId: string; };
type PlacementTask = { subjectId: string; classId: string; requiredOccurrences: number; occurrenceIndex: number; isDouble: boolean; };

// Mock State
const subjectDayCount = new Map<string, Map<string, number>>();
const classDayLoad = new Map<string, Map<string, number>>();
const globalSchedule = new Map<string, ScheduleEntry>();

function getSubjectDayCount(subjectId: string, classId: string, day: string): number {
    const key = `${classId}-${subjectId}`;
    return subjectDayCount.get(key)?.get(day) || 0;
}

function incrementSubjectDayCount(subjectId: string, classId: string, day: string): void {
    const key = `${classId}-${subjectId}`;
    if (!subjectDayCount.has(key)) subjectDayCount.set(key, new Map());
    const dayMap = subjectDayCount.get(key)!;
    dayMap.set(day, (dayMap.get(day) || 0) + 1);
}

function getClassDayLoad(classId: string, day: string): number {
    return classDayLoad.get(classId)?.get(day) || 0;
}

function incrementClassDayLoad(classId: string, day: string, amount: number = 1): void {
    if (!classDayLoad.has(classId)) classDayLoad.set(classId, new Map());
    const dayMap = classDayLoad.get(classId)!;
    dayMap.set(day, (dayMap.get(day) || 0) + amount);
}

// Mock Slots (5 days, 8 periods)
const WORKING_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const allSlots: TimeSlot[] = [];
WORKING_DAYS.forEach(day => {
    for (let p = 1; p <= 8; p++) allSlots.push({ day, period: p });
});

// Simulation of placeSingleTask with BALANCED + LOAD logic
function placeSingleTask(task: PlacementTask, maxPerDay: number, relaxed: boolean): boolean {
    const available: TimeSlot[] = [];

    for (const slot of allSlots) {
        const key = `${task.classId}-${slot.day}-${slot.period}`;
        if (globalSchedule.has(key)) continue;
        available.push(slot);
    }

    if (available.length === 0) return false;

    // Group by day
    const slotsByDay: Record<string, TimeSlot[]> = {};
    for (const slot of available) {
        if (!slotsByDay[slot.day]) slotsByDay[slot.day] = [];
        slotsByDay[slot.day].push(slot);
    }

    // BALANCED LOGIC: Sort by Subject Count ASC -> Class Load ASC -> Random
    const days = Object.keys(slotsByDay).sort((a, b) => {
        const countA = getSubjectDayCount(task.subjectId, task.classId, a);
        const countB = getSubjectDayCount(task.subjectId, task.classId, b);
        if (countA !== countB) return countA - countB;

        const loadA = getClassDayLoad(task.classId, a);
        const loadB = getClassDayLoad(task.classId, b);
        if (loadA !== loadB) return loadA - loadB;

        return Math.random() - 0.5;
    });

    for (const day of days) {
        const currentCount = getSubjectDayCount(task.subjectId, task.classId, day);
        if ((relaxed || currentCount < maxPerDay) && slotsByDay[day].length > 0) {
            // Random slot
            const daySlots = slotsByDay[day];
            const slot = daySlots[Math.floor(Math.random() * daySlots.length)];

            // Place it
            const key = `${task.classId}-${slot.day}-${slot.period}`;
            globalSchedule.set(key, { day: slot.day, period: slot.period, subjectId: task.subjectId });
            incrementSubjectDayCount(task.subjectId, task.classId, day);
            incrementClassDayLoad(task.classId, day, 1);
            return true;
        }
    }

    return false;
}

// Test Case
function runTest() {
    console.log("Starting Load Balancing Test...");

    // Reset
    subjectDayCount.clear();
    classDayLoad.clear();
    globalSchedule.clear();

    const classId = "CLASS-1";

    // Scenario: Schedule 5 different subjects, 2 periods each (10 periods total)
    // Should result in ~2 periods per day for the class
    const subjects = ["Math", "Eng", "Sci", "Tech", "Art"];

    console.log("Scheduling 5 subjects x 2 periods...");

    const tasks: PlacementTask[] = [];
    subjects.forEach(sub => {
        for (let i = 0; i < 2; i++) {
            tasks.push({
                subjectId: sub,
                classId,
                requiredOccurrences: 2,
                occurrenceIndex: i,
                isDouble: false
            });
        }
    });

    // Shuffle tasks
    tasks.sort(() => Math.random() - 0.5);

    let placedCount = 0;
    for (const task of tasks) {
        if (placeSingleTask(task, 1, false)) placedCount++;
    }

    console.log(`Placed ${placedCount}/${tasks.length} tasks.`);

    // Check Class Load Distribution
    console.log("\nClass Daily Load:");
    WORKING_DAYS.forEach(day => {
        const load = getClassDayLoad(classId, day);
        console.log(`${day}: ${load}`);
    });

    const loads = WORKING_DAYS.map(d => getClassDayLoad(classId, d));
    const max = Math.max(...loads);
    const min = Math.min(...loads);

    if (max - min > 1) {
        console.error(`\n❌ FAILED: Load is uneven! Max: ${max}, Min: ${min}`);
    } else {
        console.log(`\n✅ PASSED: Load is balanced (Max: ${max}, Min: ${min}).`);
    }

    // Check Subject Distribution
    console.log("\nSubject Distribution (Math):");
    WORKING_DAYS.forEach(day => {
        console.log(`${day}: ${getSubjectDayCount("Math", classId, day)}`);
    });
}

runTest();
