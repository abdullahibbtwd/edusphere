// prisma.config.ts (Corrected Final Version)
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // The location of your schema file (Required)
  schema: 'prisma/schema.prisma', 
  
  // Configuration for Prisma Migrate (Optional, but good practice)
  migrations: {
    path: 'prisma/migrations',
  },
  
  // The database configuration properties go DIRECTLY under 'datasource'
  datasource: { 
    // The connection URL
    url: env('DATABASE_URL'), // <-- The 'url' property is now a direct child of 'datasource'
    
    // You can also add other optional properties here if needed, like:
    // shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
})