# EduSphere

EduSphere is a multi-tenant school management platform built with Next.js and TypeScript. Each school runs on its own subdomain, has its own public school page, and manages its own academic and administrative data from a dedicated dashboard.

The platform is designed for super admins managing the entire system and for schools managing their students, teachers, classes, admissions, fees, timetables, and results in one place.

## Overview

EduSphere supports:

- A public marketing site for the platform
- School onboarding through application and approval workflows
- A dedicated subdomain for every approved school
- School-specific landing pages with editable content and branding
- Role-based access for super admin, school admin, teacher, student, and general users
- Core school operations such as admissions, class setup, timetable management, exam setup, results, and fee tracking

## Core Features

### Platform Features

- Multi-tenant school architecture using subdomains
- Super admin dashboard for school applications, subscriptions, and platform statistics
- Subscription management with plan-based request limits
- Public homepage with product sections, pricing, and school carousel

### School Features

- Editable school landing page content
- Student application and admission workflow
- Student and teacher management
- Levels, classes, and subject setup
- Teacher-to-class and teacher-to-subject assignment
- Announcements and events
- Academic sessions and terms
- School timetable and exam timetable generation
- Assessment configuration and result management
- Fee structures, payments, receipts, and finance tracking
- Profile management and password update for logged-in users

## User Roles

- `SUPER_ADMIN` — manages schools, subscriptions, approvals, and platform-level data
- `ADMIN` — manages school operations
- `TEACHER` — accesses teacher-related academic workflows
- `STUDENT` — accesses student-facing school features
- `USER` — general authenticated user, commonly used before assignment into a school role

## Tech Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Radix UI
- MUI
- ApexCharts and Recharts

### Backend and Data

- Next.js App Router API routes
- Prisma ORM
- PostgreSQL
- JWT-based authentication
- Upstash Redis for caching

### Supporting Services

- Cloudinary for media handling
- Resend for email delivery
- jsPDF and React PDF for document generation

## Project Structure

- `src/app` — app routes, API routes, dashboards, and school subdomain pages
- `src/components` — shared UI and feature components
- `src/lib` — auth, Prisma, Redis, rate limiting, and utility code
- `prisma` — schema, migrations, and seed files

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Set the required environment variables in `.env` or `.env.local`, including values such as:

- `DATABASE_URL`
- `JWT_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- any email or media credentials your environment requires

### 3. Run Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Start the development server

```bash
npm run dev
```

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — start the production server

## Notes

- The app uses subdomain-based routing, so local development may require suitable host configuration depending on what you are testing.
- Redis is used as a cache layer and should fail safely when not configured.
- Some legacy pages may still be under cleanup or refactoring as the platform continues to evolve.
