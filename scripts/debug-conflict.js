"use strict";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  console.log("\u{1F50D} Checking Teachers...");
  const teachers = await prisma.teacher.findMany({
    where: { name: { contains: "Abdullahi Bashir", mode: "insensitive" } },
    select: { id: true, name: true, teacherId: true }
  });
  console.table(teachers);
  console.log("\n\u{1F50D} Checking Allocations for JSS1A and JSS2A (Test Subjects)...");
  const classes = await prisma.class.findMany({
    where: { name: { in: ["JSS1A", "JSS2A"] } },
    include: { level: true }
  });
  for (const cls of classes) {
    console.log(`
Class: ${cls.name} (${cls.id})`);
    const allocations = await prisma.teacherSubjectClass.findMany({
      where: {
        classId: cls.id,
        subject: { name: { contains: "Test", mode: "insensitive" } }
      },
      include: { teacher: true, subject: true }
    });
    allocations.forEach((alloc) => {
      console.log(`  - Subject: ${alloc.subject.name}`);
      console.log(`    Teacher: ${alloc.teacher.name} (ID: ${alloc.teacher.id})`);
    });
    if (allocations.length === 0) {
      console.log("  No 'Test Subject' allocations found.");
      const allDocs = await prisma.teacherSubjectClass.findMany({
        where: { classId: cls.id },
        include: { subject: true, teacher: true }
      });
      console.log("  All Subjects:", allDocs.map((d) => `${d.subject.name} (${d.teacher.name})`).join(", "));
    }
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
