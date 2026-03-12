import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import ProfilePage from '@/components/shared/ProfilePage';

export default async function ProfileRoute() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) redirect('/auth');

  const payload = verifyToken(token);
  if (!payload) redirect('/auth');

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      student: { select: { profileImagePath: true, dob: true, gender: true, address: true, className: true } },
      teacher: { select: { img: true, birthday: true, sex: true, address: true } },
    },
  });

  if (!user) redirect('/auth');

  // Resolve profile image: student / teacher image takes priority over user.imageUrl
  const imageUrl =
    user.student?.profileImagePath ||
    user.teacher?.img ||
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
        // Extended fields for students
        ...(user.student && {
          dob: user.student.dob?.toISOString() ?? null,
          gender: user.student.gender ?? null,
          address: user.student.address ?? null,
          className: user.student.className ?? null,
        }),
        // Extended fields for teachers
        ...(user.teacher && {
          dob: user.teacher.birthday?.toISOString() ?? null,
          gender: user.teacher.sex ?? null,
          address: user.teacher.address ?? null,
        }),
      }}
    />
  );
}
