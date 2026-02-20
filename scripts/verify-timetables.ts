/**
 * Test script to verify all timetables for conflicts
 * 
 * Usage:
 * 1. Make sure your dev server is running (npm run dev)
 * 2. Run: npx tsx scripts/verify-timetables.ts
 */

const SCHOOL_ID = 'cmk9qgrwz000360igxkc2hrkx'; // Your school ID
const TERM = 'FIRST'; // Change to SECOND or THIRD as needed
const API_URL = 'http://localhost:3000'; // Change if using different port

async function verifyTimetables() {
    console.log('🔍 Starting Timetable Conflict Verification...\n');
    console.log(`School ID: ${SCHOOL_ID}`);
    console.log(`Term: ${TERM}`);
    console.log(`API URL: ${API_URL}\n`);
    console.log('═══════════════════════════════════════════════════════════\n');

    try {
        const url = `${API_URL}/api/schools/${SCHOOL_ID}/timetable/verify?term=${TERM}`;

        console.log(`📡 Fetching: ${url}\n`);

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error('❌ API Error:', data.error);
            process.exit(1);
        }

        console.log('📊 VERIFICATION RESULTS:\n');
        console.log('═══════════════════════════════════════════════════════════\n');

        if (data.hasConflicts) {
            console.log(`❌ CONFLICTS FOUND: ${data.conflicts.length}\n`);

            data.conflicts.forEach((conflict: any, index: number) => {
                console.log(`Conflict #${index + 1}:`);
                console.log(`  Teacher: ${conflict.teacherName} (${conflict.teacherId})`);
                console.log(`  Day: ${conflict.day}`);
                console.log(`  Time: ${conflict.time}`);
                console.log(`  Class 1: ${conflict.class1} - ${conflict.subject1}`);
                console.log(`  Class 2: ${conflict.class2} - ${conflict.subject2}`);
                console.log('───────────────────────────────────────────────────────────\n');
            });
        } else {
            console.log('✅ NO CONFLICTS FOUND!\n');
            console.log('All teachers are properly scheduled without overlaps.\n');
        }

        console.log('📈 SUMMARY:\n');
        console.log(`  Total Timetables: ${data.summary.totalTimetables}`);
        console.log(`  Total Schedule Entries: ${data.summary.totalEntries}`);
        console.log(`  Total Conflicts: ${data.summary.totalConflicts}`);
        console.log(`  Teachers Involved: ${data.summary.teacherCount}`);
        console.log('\n═══════════════════════════════════════════════════════════\n');

        if (data.hasConflicts) {
            console.log('❌ VERIFICATION FAILED - Conflicts detected!\n');
            process.exit(1);
        } else {
            console.log('✅ VERIFICATION PASSED - No conflicts!\n');
            process.exit(0);
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyTimetables();
