import { PrismaClient, Term } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const schoolId = 'cmk9qgrwz000360igxkc2hrkx';

// DEFINED IDs from User Input
const levelIds = {
    JSS1: 'cmlfm3o8n0000uwigboav4m3t',
    JSS2: 'cmlfm3o9g0001uwigon3nqc48',
    JSS3: 'cmlfm3o9j0002uwigi6r0mplx',
    SS1: 'cmlfmb1n30003uwignntnpu1g',
    SS2: 'cmlfmb1nm0004uwigqkgo8cdq',
    SS3: 'cmlfmb1nq0005uwigua4sfv5s',
};

const levels = [
    { id: levelIds.JSS1, name: 'JSS1' },
    { id: levelIds.JSS2, name: 'JSS2' },
    { id: levelIds.JSS3, name: 'JSS3' },
    { id: levelIds.SS1, name: 'SS1' },
    { id: levelIds.SS2, name: 'SS2' },
    { id: levelIds.SS3, name: 'SS3' },
];

const classes = [
    // JSS1
    { id: 'cmligsu2y0004y4igh1st09gb', name: 'JSS1A', levelId: levelIds.JSS1 },
    { id: 'cmligsu2y0005y4ig2fpewehg', name: 'JSS1B', levelId: levelIds.JSS1 },
    { id: 'cmligsu2y0006y4igl72luyrs', name: 'JSS1C', levelId: levelIds.JSS1 },
    // JSS2
    { id: 'cmligsu2y0007y4igkvuhcr2o', name: 'JSS2A', levelId: levelIds.JSS2 },
    { id: 'cmligsu2z0008y4igfxharawi', name: 'JSS2B', levelId: levelIds.JSS2 },
    { id: 'cmligsu2z0009y4ignpms9o0x', name: 'JSS2C', levelId: levelIds.JSS2 },
    // JSS3
    { id: 'cmligsu2z000ay4ig4ui6haww', name: 'JSS3A', levelId: levelIds.JSS3 },
    { id: 'cmligsu2z000by4ig9oha0dd3', name: 'JSS3B', levelId: levelIds.JSS3 },
    { id: 'cmligsu2z000cy4igmit65xho', name: 'JSS3C', levelId: levelIds.JSS3 },
    // SS1
    { id: 'cmligt3a5000dy4igt10dm36m', name: 'SS1A', levelId: levelIds.SS1 },
    { id: 'cmligt3a5000ey4ig9dwzzsri', name: 'SS1B', levelId: levelIds.SS1 },
    { id: 'cmligt3a5000fy4igzjjbszvm', name: 'SS1C', levelId: levelIds.SS1 },
    // SS2
    { id: 'cmligt3a5000gy4ig27ygx3sq', name: 'SS2A', levelId: levelIds.SS2 },
    { id: 'cmligt3a6000hy4ig3sjjs2zg', name: 'SS2B', levelId: levelIds.SS2 },
    { id: 'cmligt3a6000iy4iguev37xax', name: 'SS2C', levelId: levelIds.SS2 },
    // SS3
    { id: 'cmligt3a6000jy4igdtjvnzhr', name: 'SS3A', levelId: levelIds.SS3 },
    { id: 'cmligt3a6000ky4igk1x8c1kh', name: 'SS3B', levelId: levelIds.SS3 },
    { id: 'cmligt3a6000ly4iguyl8r4fh', name: 'SS3C', levelId: levelIds.SS3 },
];

const subjectsList = [
    // General (All Levels) - Reduced hours to fit in 40 slots/week
    { name: 'Mathematics', levels: ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'], hoursPerWeek: 4 },
    { name: 'English Language', levels: ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'], hoursPerWeek: 4 },
    { name: 'Civic Education', levels: ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'], hoursPerWeek: 2 },
    { name: 'Computer Studies', levels: ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'], hoursPerWeek: 2 },

    // Junior Only
    { name: 'Basic Science', levels: ['JSS1', 'JSS2', 'JSS3'], hoursPerWeek: 3 },
    { name: 'Basic Technology', levels: ['JSS1', 'JSS2', 'JSS3'], hoursPerWeek: 2 },
    { name: 'Social Studies', levels: ['JSS1', 'JSS2', 'JSS3'], hoursPerWeek: 2 },
    { name: 'Business Studies', levels: ['JSS1', 'JSS2', 'JSS3'], hoursPerWeek: 2 },
    { name: 'Home Economics', levels: ['JSS1', 'JSS2', 'JSS3'], hoursPerWeek: 2 },
    { name: 'Agricultural Science', levels: ['JSS1', 'JSS2', 'JSS3'], hoursPerWeek: 2 },
    { name: 'Physical Health Education', levels: ['JSS1', 'JSS2', 'JSS3'], hoursPerWeek: 2 },
    { name: 'French', levels: ['JSS1', 'JSS2'], hoursPerWeek: 2 },
    { name: 'Christian Religious Studies', levels: ['JSS1', 'JSS2', 'JSS3'], hoursPerWeek: 1 },

    // Senior Only
    { name: 'Biology', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 3 },
    { name: 'Physics', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 3 },
    { name: 'Chemistry', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 3 },
    { name: 'Literature in English', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 2 },
    { name: 'Government', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 2 },
    { name: 'Economics', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 2 },
    { name: 'Geography', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 2 },
    { name: 'Further Mathematics', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 3 },
    { name: 'Technical Drawing', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 2 },
    { name: 'Food and Nutrition', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 2 },
    { name: 'Financial Accounting', levels: ['SS1', 'SS2'], hoursPerWeek: 2 },
    { name: 'Commerce', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 2 },
    { name: 'Data Processing', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 2 },
    { name: 'Marketing', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 2 },
    { name: 'Animal Husbandry', levels: ['SS1', 'SS2', 'SS3'], hoursPerWeek: 2 },
];

async function main() {
    console.log('🌱 Seeding with 30 Teachers (Max 6 Classes Each)...');

    // Cleanup
    console.log('🧹 Cleaning up old data...');
    await prisma.teacherSubjectClass.deleteMany({ where: { schoolId } });
    await prisma.subject.deleteMany({ where: { schoolId } });
    await prisma.teacher.deleteMany({ where: { schoolId } });

    // 1. Create 60 Teachers
    console.log('👨‍🏫 Creating 60 Teachers...');
    const teachers = [];
    const baseNames = [
        'Abdullahi Bashir', 'Fatima Hassan', 'Ibrahim Musa', 'Aisha Yusuf', 'Muhammad Ali',
        'Zainab Ahmed', 'Usman Bello', 'Hauwa Sani', 'Yusuf Garba', 'Maryam Umar',
        'Suleiman Isa', 'Amina Bala', 'Aliyu Danjuma', 'Khadija Suleiman', 'Bashir Adamu',
        'Halima Ibrahim', 'Nasir Abdullahi', 'Safiya Musa', 'Kabir Hassan', 'Ruqayya Usman',
        'Ismail Bello', 'Jamila Yusuf', 'Murtala Garba', 'Nana Aisha', 'Sadiq Ahmed',
        'Bilkisu Sani', 'Hamza Danjuma', 'Zulaiha Aliyu', 'Faruk Isa', 'Hadiza Bala'
    ];

    for (let i = 1; i <= 60; i++) {
        const teacherId = `T-${String(i).padStart(3, '0')}`;
        const name = i <= 30 ? baseNames[i - 1] : `Teacher ${baseNames[(i - 1) % 30].split(' ')[1]} ${i}`;

        const teacher = await prisma.teacher.create({
            data: {
                teacherId,
                name,
                email: `teacher${i}@edusphere.com`,
                phone: `+234${String(8000000000 + i).substring(1)}`,
                address: `${i} Teacher's Quarters, School Compound`,
                birthday: `19${60 + (i % 30)}-0${(i % 12) + 1}-15`,
                sex: i % 2 === 0 ? 'Male' : 'Female',
                img: '/default-avatar.png',
                schoolId
            }
        });
        teachers.push(teacher);
    }

    // 2. Create Subjects & Assign to Levels
    console.log('📚 Creating Subjects and Linking to Levels...');
    const createdSubjects = [];
    const classAssignments = ['A', 'B', 'C'];

    for (const template of subjectsList) {
        let assignment: string | null = null;

        // 60% general, 40% specific streams
        const rand = Math.random();
        if (rand < 0.6) {
            assignment = null; // General - all streams
        } else {
            // Assign to 1-2 random streams
            const streams = classAssignments.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
            assignment = streams.join(', ');
        }

        const linkedLevels = levels.filter(l => template.levels.includes(l.name));
        const matchesAllLevels = linkedLevels.length === levels.length;
        const isGeneral = matchesAllLevels && !assignment;

        const createdSub = await prisma.subject.create({
            data: {
                name: template.name,
                code: template.name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000),
                creditUnit: Math.floor(Math.random() * 3) + 1,
                term: Term.FIRST,
                isGeneral: isGeneral,
                classAssignment: assignment,
                schoolId,
                levels: {
                    connect: linkedLevels.map(l => ({ id: l.id }))
                }
            },
            include: {
                levels: true
            }
        });
        createdSubjects.push({ ...createdSub, hoursPerWeek: template.hoursPerWeek });
    }

    // 3. Assign Subjects to Teachers and Classes
    console.log('🔗 Assigning Subjects to Teachers and Classes...');

    // Track state
    // purely for logic checks
    const teacherLoad = new Map<string, number>(); // teacherId -> count of classes
    const teacherSubjects = new Map<string, Set<string>>(); // teacherId -> Set of subjectIds
    const teacherClassesMap = new Map<string, Set<string>>(); // teacherId -> Set of classIds

    // Initialize maps
    teachers.forEach(t => {
        teacherLoad.set(t.id, 0);
        teacherSubjects.set(t.id, new Set());
        teacherClassesMap.set(t.id, new Set());
    });

    // Create a pool of subject-class combinations
    const assignments: Array<{ subjectId: string; classId: string; hoursPerWeek: number }> = [];

    for (const subject of createdSubjects) {
        const subjectLevelIds = subject.levels.map(l => l.id);
        const allowedSuffixes = subject.classAssignment ? subject.classAssignment.split(', ') : classAssignments;

        const eligibleClasses = classes.filter(cls => {
            const matchesLevel = subjectLevelIds.includes(cls.levelId);
            const matchesStream = allowedSuffixes.some(suffix => cls.name.endsWith(suffix));
            return matchesLevel && matchesStream;
        });

        for (const cls of eligibleClasses) {
            assignments.push({
                subjectId: subject.id,
                classId: cls.id,
                hoursPerWeek: subject.hoursPerWeek
            });
        }
    }

    console.log(`📋 Total Subject-Class Combinations: ${assignments.length}\n`);

    // Assign to teachers with MAX 6 CLASSES constraint
    let assignedCount = 0;
    let skippedCount = 0;

    // Shuffle assignments for variety
    assignments.sort(() => 0.5 - Math.random());

    for (const assignment of assignments) {
        let selectedTeacher = null;
        let bestScore = -1;

        // Scoring criteria:
        // 1. Must implement max 6 classes rule (HARD CONSTRAINT)
        // 2. Must not be already assigned this subject-class (HARD CONSTRAINT)
        // 3. Favor teacher who already teaches this subject (SPECIALIZATION)
        // 4. Favor teacher with fewer total classes (LOAD BALANCING)
        // 5. Penalize teacher who already teaches multiple subjects to THIS class (DIVERSITY)

        for (const teacher of teachers) {
            const currentLoad = teacherLoad.get(teacher.id) || 0;
            const subjects = teacherSubjects.get(teacher.id)!;
            const classesTaught = teacherClassesMap.get(teacher.id)!;

            // Hard Constraints
            if (currentLoad >= 6) continue; // Max 6 classes

            // Avoid duplicate assignment (although unlikely with unique assignment list)
            // We can check db, but relies on local state `classesTaught` isn't granular enough to know (subject, class).
            // However, `assignments` iterates unique (subject, class) pairs, so a teacher is never assigned the same pair twice in this loop.

            // Calculate Score
            let score = 0;

            // SPECIALIZATION: HUGE Bonus if they already teach this subject
            if (subjects.has(assignment.subjectId)) {
                score += 50;
            }

            // PENALTY: Being a jack-of-all-trades
            // If they teach 2+ DIFFERENT subjects already, small penalty to encourage specialization
            // But user said "multiple subjects" is OK, so we won't penalize too heavily, just a bit.
            if (subjects.size >= 2 && !subjects.has(assignment.subjectId)) {
                score -= 10;
            }
            if (subjects.size >= 3 && !subjects.has(assignment.subjectId)) {
                score -= 30; // Stronger deterrent for >3 subjects
            }

            // DIVERSITY IN CLASS: 
            // Check how many subjects this teacher already teaches in THIS specific class
            // We need a way to track (Teacher -> Class -> Count of Subjects)
            // Let's do a quick scan of what we've assigned so far? 
            // Actually, we can just look at `teacherClassesMap` to see if they are in the class, 
            // but that doesn't tell us HOW MANY subjects. 
            // Let's create a helper map for this check? 
            // For now, simpler heuristic:
            // If they already teach this class, check logic:
            if (classesTaught.has(assignment.classId)) {
                // They are already in this class. 
                // If they are specialists (score 50), it means they are teaching the SAME subject to this class? 
                // No, distinct (Subject, Class) pairs.
                // So if they are in the class, they are teaching a DIFFERENT subject.
                // We generally want to avoid one teacher teaching multiple subjects to the same class unless necessary.
                score -= 40;
            }

            // LOAD BALANCING
            // Prefer teachers with less load to spread work
            score -= (currentLoad * 2);

            // Random tie-breaker
            score += Math.random();

            if (score > bestScore) {
                bestScore = score;
                selectedTeacher = teacher;
            }
        }

        if (!selectedTeacher) {
            console.warn(`⚠️ Could not find suitable teacher for subject ${assignment.subjectId} in class ${assignment.classId}. Assignments remaining: ${assignments.length - assignedCount}`);
            skippedCount++;
            continue;
        }

        try {
            await prisma.teacherSubjectClass.create({
                data: {
                    teacherId: selectedTeacher.id,
                    subjectId: assignment.subjectId,
                    classId: assignment.classId,
                    hoursPerWeek: assignment.hoursPerWeek,
                    schoolId,
                    assignedBy: 'SEED_REFACTOR'
                }
            });

            // Update state
            teacherLoad.set(selectedTeacher.id, (teacherLoad.get(selectedTeacher.id) || 0) + 1);
            teacherSubjects.get(selectedTeacher.id)!.add(assignment.subjectId);
            teacherClassesMap.get(selectedTeacher.id)!.add(assignment.classId);

            assignedCount++;
        } catch (error) {
            console.error(`Error assigning: ${error}`);
            skippedCount++;
        }
    }

    // Print summary
    console.log('\n📊 Assignment Summary:');
    console.log(`   Total Assignments Created: ${assignedCount}`);
    console.log(`   Skipped: ${skippedCount}\n`);

    console.log('👨‍🏫 Teacher Workload:');
    for (const teacher of teachers) {
        const load = teacherLoad.get(teacher.id);
        const uniqueSubjects = teacherSubjects.get(teacher.id)?.size || 0;
        const uniqueClasses = teacherClassesMap.get(teacher.id)?.size || 0;

        console.log(`   ${teacher.name}: ${load} classes, ${uniqueSubjects} subjects`);

        if (load === 0) console.warn(`   ⚠️  ${teacher.name} has 0 classes!`);
        if (load === 6) console.log(`      (Max Capacity Reached)`);
    }

    console.log('\n✅ Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
