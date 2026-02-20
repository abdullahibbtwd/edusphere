
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const teachers = await prisma.teacher.findMany({
        where: {
            name: {
                contains: 'Abdullahi Bashir',
                mode: 'insensitive' // case-insensitive
            }
        },
        include: {
            teacherSubjectClasses: {
                include: {
                    class: true,
                    subject: true
                }
            }
        }
    });

    console.log(`Found ${teachers.length} teachers matching 'Abdullahi Bashir':`);
    teachers.forEach(t => {
        console.log(`- ID: ${t.id}, Name: ${t.name}, Email: ${t.email}`);
        console.log(`  Allocations: ${t.teacherSubjectClasses.length}`);
        t.teacherSubjectClasses.forEach(alloc => {
            console.log(`    - ${alloc.subject.name} in ${alloc.class.name}`);
        });
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
