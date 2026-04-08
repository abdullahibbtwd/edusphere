import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { SchoolData } from "@/types/school-data";

/** Shared Prisma shape for public landing + dashboard shell (matches former API include). */
export async function loadSchoolLandingFromDb(subdomain: string) {
  return prisma.school.findUnique({
    where: {
      subdomain,
      isActive: true,
    },
    include: {
      content: true,
      levels: {
        where: { isActive: true },
        include: {
          classes: {
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      },
      subjects: {
        orderBy: { name: "asc" },
      },
      students: {
        select: { id: true },
      },
    },
  });
}

/**
 * Server Components only. Cross-request cache (default 1h) + per-subdomain key; use
 * `revalidateTag("school-landing")` after CMS updates if needed. API routes should call
 * `loadSchoolLandingFromDb` (Redis wraps those requests separately).
 */
export const getSchoolLandingData = unstable_cache(
  async (subdomain: string) => loadSchoolLandingFromDb(subdomain),
  ["school-landing"],
  { revalidate: 3600, tags: ["school-landing"] }
);

export type SchoolLandingData = NonNullable<
  Awaited<ReturnType<typeof loadSchoolLandingFromDb>>
>;

/** Align Prisma payload with client `SchoolData` (Json fields). Safe for Server Components. */
export function toSchoolDataPayload(row: SchoolLandingData): SchoolData {
  return row as unknown as SchoolData;
}
