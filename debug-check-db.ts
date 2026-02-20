
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const subdomain = 'gwale';
    console.log(`Checking DB for school with subdomain: "${subdomain}"`);

    const school = await prisma.school.findFirst({
        where: { subdomain: subdomain }
    });

    if (!school) {
        console.error('❌ School NOT found in DB.');
        const allSchools = await prisma.school.findMany({ select: { id: true, name: true, subdomain: true } });
        console.log('Available schools:', allSchools);
        return;
    }

    console.log(`✅ Found school: ${school.name} (ID: ${school.id})`);

    const levels = await prisma.level.findMany({
        where: { schoolId: school.id }
    });
    console.log(`Levels count: ${levels.length}`);
    levels.forEach(l => console.log(` - ${l.name} (${l.id})`));

    const classes = await prisma.class.findMany({
        where: { schoolId: school.id }
    });
    console.log(`Classes count: ${classes.length}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
