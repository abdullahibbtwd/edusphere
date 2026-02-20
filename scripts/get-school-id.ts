
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const school = await prisma.school.findFirst({
        where: { isActive: true },
        select: { id: true, name: true }
    });

    if (school) {
        console.log(`School ID: ${school.id}`);
        console.log(`School Name: ${school.name}`);
    } else {
        console.log('No active school found.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
