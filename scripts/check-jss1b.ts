import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkJSS1BSubjects() {
    const allocations = await prisma.teacherSubjectClass.findMany({
        where: {
            class: {
                name: 'JSS1B'
            }
        },
        include: {
            subject: true,
            teacher: true,
            class: {
                include: {
                    level: true
                }
            }
        }
    });

    console.log('\n📚 JSS1B Subject Allocations:\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    let totalHours = 0;
    allocations.forEach(a => {
        console.log(`${a.subject.name}:`);
        console.log(`  Teacher: ${a.teacher.name}`);
        console.log(`  Hours/Week: ${a.hoursPerWeek}`);
        console.log('');
        totalHours += a.hoursPerWeek;
    });

    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`Total Subjects: ${allocations.length}`);
    console.log(`Total Hours/Week: ${totalHours}`);
    console.log(`Available Slots: 40 (8 periods × 5 days)`);
    console.log(`Utilization: ${((totalHours / 40) * 100).toFixed(1)}%\n`);

    await prisma.$disconnect();
}

checkJSS1BSubjects();
