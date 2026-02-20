import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
    console.log('Testing connection...');
    try {
        const count = await prisma.user.count();
        console.log(`Connection successful. User count: ${count}`);
    } catch (e: any) {
        console.error('Connection failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
