// import { PrismaClient } from '@prisma/client';

// // PrismaClient is attached to the `global` object in development to prevent
// // exhausting your database connection limit.
// const globalForPrisma = global as unknown as { prisma: PrismaClient };

// export const prisma =
//     globalForPrisma.prisma ||
//     new PrismaClient({
//         log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
//     });

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';
// 1. Import the necessary adapter
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// 2. Initialize the adapter instance
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        // 3. Pass the adapter instance to the constructor
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;