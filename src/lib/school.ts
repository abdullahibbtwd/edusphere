import redis from '@/lib/redis';
import { prisma } from '@/lib/prisma';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CachedSchool = { id: string; name: string; subdomain: string; isAdmissionsOpen: boolean };

export async function getSchool(schoolId: string): Promise<CachedSchool | null> {
  const cached = await redis.get(`school:${schoolId}`);
  if (cached) {
    if (typeof cached === 'string') {
      try {
        return JSON.parse(cached) as CachedSchool;
      } catch {
        return null;
      }
    }
    return cached as CachedSchool;
  }

  const isUUID = UUID_RE.test(schoolId);

  // Skip the ID lookup entirely when the input is clearly a subdomain string —
  // avoids a wasted DB round trip on every cache miss.
  const school = isUUID
    ? await prisma.school.findUnique({
        where: { id: schoolId },
        select: { id: true, name: true, subdomain: true, isAdmissionsOpen: true }
      })
    : await prisma.school.findUnique({
        where: { subdomain: schoolId, isActive: true },
        select: { id: true, name: true, subdomain: true, isAdmissionsOpen: true }
      });

  if (!school) return null;

  // Cache by both id AND subdomain so either lookup hits cache next time (TTL in seconds)
  await Promise.all([
    redis.set(`school:${school.id}`, JSON.stringify(school), 3600),
    redis.set(`school:${school.subdomain}`, JSON.stringify(school), 3600),
  ]);

  return school;
}
