# EduSphere — Multi-Tenant School Management Platform

A full-stack, multi-tenant **College & School Management System** built with **Next.js**, **TypeScript**, **Clerk Authentication**, and **Convex** as the real-time backend.  
Designed for schools in **Kano State and beyond**, the platform provides **subdomains** for each school, complete with a landing page, admin dashboard, teacher dashboard, student dashboard, and parent dashboard.  

## 🚀 Features

- **Multi-Tenant System** — Each school gets a subdomain (`schoolname.edusphere.com`) with its own landing page, branding, and data.
- **Role-Based Dashboards**
  - **Super Admin** — Manage all schools, analytics, and platform settings.
  - **School Admin** — Manage teachers, students, classes, subjects, results, timetables, and payments.
  - **Teacher** — Manage classes, upload results, view schedules.
  - **Student** — View timetable, results, announcements, and upcoming events.
  - **Parent** — Track student progress, attendance, and results.
- **Automated Timetable Generation** — Dynamically creates timetables based on subjects and teachers’ availability.
- **Automated Result Generation** — Teachers upload scores; the system auto-calculates grades and generates downloadable PDFs.
- **Analytics & Reports** — ApexCharts-powered insights on student performance, school statistics, and more.
- **Fully Responsive** — Works on mobile, tablet, and desktop.
- **Dark & Light Mode** — Eye-friendly colors for both themes.

## 🛠 Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) — React framework with server-side rendering
- [TypeScript](https://www.typescriptlang.org/) — Type-safe development
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [Framer Motion](https://www.framer.com/motion/) — Smooth animations
- [ApexCharts](https://apexcharts.com/) — Interactive charts and analytics

**Backend**
- [Convex](https://convex.dev/) — Real-time database and backend functions
- [Clerk](https://clerk.com/) — Authentication and role-based access control
- [Zod](https://zod.dev/) — Schema validation
- [jsPDF](https://github.com/parallax/jsPDF) — PDF generation for results



