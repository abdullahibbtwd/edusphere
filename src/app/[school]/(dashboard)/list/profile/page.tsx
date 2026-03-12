import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import ProfilePage from '@/components/shared/ProfilePage';

interface PageProps {
  params: Promise<{ school: string }>;
}

export default async function SchoolProfilePage({ params }: PageProps) {
  const { school: subdomain } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) redirect(`/${subdomain}/auth`);

  const payload = verifyToken(token);
  if (!payload) redirect(`/${subdomain}/auth`);

  const school = await prisma.school.findUnique({
    where: { subdomain },
    select: { id: true },
  });
  if (!school) redirect('/');

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      student: { select: { schoolId: true, profileImagePath: true, dob: true, gender: true, address: true, className: true } },
      teacher: { select: { schoolId: true, img: true, birthday: true, sex: true, address: true } },
    },
  });

  if (!user) redirect(`/${subdomain}/auth`);

  const studentInThisSchool = user.student?.schoolId === school.id ? user.student : null;
  const teacherInThisSchool = user.teacher?.schoolId === school.id ? user.teacher : null;

  const imageUrl =
    studentInThisSchool?.profileImagePath ||
    teacherInThisSchool?.img ||
    user.imageUrl ||
    null;

  return (
    <ProfilePage
      profile={{
        id: user.id,
        name: user.name ?? '',
        email: user.email,
        phone: user.phone ?? null,
        imageUrl,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt.toISOString(),
        ...(studentInThisSchool && {
          dob: studentInThisSchool.dob?.toISOString() ?? null,
          gender: studentInThisSchool.gender ?? null,
          address: studentInThisSchool.address ?? null,
          className: studentInThisSchool.className ?? null,
        }),
        ...(teacherInThisSchool && {
          dob: teacherInThisSchool.birthday?.toISOString() ?? null,
          gender: teacherInThisSchool.sex ?? null,
          address: teacherInThisSchool.address ?? null,
        }),
      }}
    />
  );
}
