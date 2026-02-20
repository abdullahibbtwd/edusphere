
import { prisma } from './src/lib/db';

async function main() {
    const subdomain = 'abdullahibbtwd';
    console.log(`Looking for school with subdomain: ${subdomain}`);

    const school = await prisma.school.findFirst({
        where: { subdomain }
    });

    if (!school) {
        console.error('School not found');
        return;
    }

    console.log(`Found school: ${school.name} (${school.id})`);

    const levels = await prisma.level.findMany({
        where: { schoolId: school.id }
    });

    console.log(`Found ${levels.length} levels:`);
    levels.forEach(l => console.log(`- ${l.name} (${l.id})`));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
