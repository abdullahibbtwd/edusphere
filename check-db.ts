import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const output: any = {};

    try {
        output.connection = 'SUCCESS';

        output.tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

        output.student_applications_columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student_applications'
    `;

        output.users_columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `;

        fs.writeFileSync('db-schema-output.json', JSON.stringify(output, null, 2));
        console.log('Results written to db-schema-output.json');

    } catch (e: any) {
        console.error(e);
        fs.writeFileSync('db-schema-error.txt', e.toString());
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
