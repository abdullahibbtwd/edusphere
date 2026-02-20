
// Mock types
type ScheduleEntry = {
    day: string;
    period: number;
    teacherId: string;
    subjectName: string;
    className: string;
    startTime: string;
    endTime: string;
};

// Simplified Logic from conflict-checker.ts
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

    const s1 = toMinutes(start1); // e.g., 11:10 -> 670
    const e1 = toMinutes(end1);   // e.g., 11:50 -> 710
    const s2 = toMinutes(start2); // e.g., 11:10 -> 670
    const e2 = toMinutes(end2);   // e.g., 11:50 -> 710

    // Logic: Start1 < End2 AND Start2 < End1
    // 670 < 710 (True) AND 670 < 710 (True) -> True
    return s1 < e2 && s2 < e1;
}

function runTest() {
    console.log("Starting Conflict Logic Test...");

    // Case 1: Exact Overlap
    const conflict = timesOverlap("11:10", "11:50", "11:10", "11:50");
    if (conflict) console.log("✅ Exact Overlap: Detected");
    else console.error("❌ Exact Overlap: NOT Detected");

    // Case 2: Partial Overlap
    const conflict2 = timesOverlap("11:10", "11:50", "11:30", "12:10");
    if (conflict2) console.log("✅ Partial Overlap: Detected");
    else console.error("❌ Partial Overlap: NOT Detected");

    // Case 3: No Overlap
    const conflict3 = timesOverlap("08:00", "08:40", "09:00", "09:40");
    if (!conflict3) console.log("✅ No Overlap: Correct");
    else console.error("❌ No Overlap: False Positive");
}

runTest();
