
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const idsToCheck = [
        'cmlqcrom5000y1sigfs8w8ahh',
        'cmlqcrold000e1sigucwy44i7',
        'cmlqcron1001k1sigbcjl398t',
        'cmlqcromv001g1sigokgl6h7g',
        'cmlqcroli000h1sigqfi9ac5x',
        'cmlqcrolc000d1sigtk2tzcqs'
    ];

    console.log('Checking specific IDs from logs...');

    // Check Teacher Names
    const teachers = await prisma.teacher.findMany({
        where: {
            id: { in: idsToCheck }
        },
        select: { id: true, name: true }
    });
    console.table(teachers);

    // Check Allocations
    const allocations = await prisma.teacherSubjectClass.findMany({
        where: {
            teacherId: { in: idsToCheck }
        },
        include: {
            teacher: true,
            subject: true,
            class: true // Note: 'class' might be reserved, check if it's 'Class' or 'class_'
        }
    });

    console.log(`\nFound ${allocations.length} allocations.`);
    allocations.forEach((alloc: any) => {
        console.log(`  - Subject: ${alloc.subject?.name}`);
        console.log(`    Teacher: ${alloc.teacher?.name} (ID: ${alloc.teacher?.id})`);
        console.log(`    Class: ${alloc.class?.name}`);
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
