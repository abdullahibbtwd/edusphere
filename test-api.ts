
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listSchools() {
    try {
        console.log('Connecting to database...');
        const schools = await prisma.school.findMany();
        console.log('Schools found:', schools.length);
        schools.forEach(s => {
            console.log(`ID: ${s.id}, Name: ${s.name}, Subdomain: ${s.subdomain}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listSchools();
