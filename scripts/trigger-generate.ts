
import { PrismaClient } from '@prisma/client';

async function main() {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:3000/api/schools/cmlz2l4nj0006ekignelbr07a/timetable/generate-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: 'FIRST' })
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log(data);
}

main().catch(console.error);
