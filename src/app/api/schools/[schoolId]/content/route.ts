import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

// GET - Fetch school content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolIdentifier } = await params;
    const school = await getSchool(schoolIdentifier);
    const schoolId = school?.id;
    if (!schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Get school content
    const content = await db.schoolContent.findUnique({
      where: { schoolId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            address: true,
            phoneNumber: true,
            email: true,
            totalStudents: true,
            totalTeachers: true,
          }
        }
      }
    });

    if (!content) {
      // Return null if no content exists - let the frontend handle the empty state
      return NextResponse.json(null);
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching school content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update school content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const sessionUser = requireRole(request, ['ADMIN']);
  if (sessionUser instanceof NextResponse) return sessionUser;

  try {
    const { schoolId: schoolIdentifier } = await params;
    const school = await getSchool(schoolIdentifier);
    const schoolId = school?.id;
    if (!schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    if (sessionUser.schoolId && sessionUser.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Forbidden - You can only manage your school content' }, { status: 403 });
    }

    const body = await request.json();

    const {
      heroTitle,
      heroSubtitle,
      heroImage,
      schoolLogo,
      bannerTitle,
      bannerImage,
      bannerStats,
      aboutTitle,
      aboutDescription,
      aboutImage,
      description,
      contactAddress,
      contactPhone,
      contactEmail,
      facilities,
      campusImages,
      softSkills,
      classes,
      levelSelection,
      facebookUrl,
      twitterUrl,
      instagramUrl,
      linkedinUrl,
    } = body;

    const content = await db.schoolContent.upsert({
      where: { schoolId },
      update: {
        heroTitle,
        heroSubtitle,
        heroImage,
        schoolLogo,
        bannerTitle,
        bannerImage,
        bannerStats,
        aboutTitle,
        aboutDescription,
        aboutImage,
        description,
        contactAddress,
        contactPhone,
        contactEmail,
        facilities,
        campusImages,
        softSkills,
        classes,
        levelSelection,
        facebookUrl,
        twitterUrl,
        instagramUrl,
        linkedinUrl,
      },
      create: {
        schoolId,
        heroTitle,
        heroSubtitle,
        heroImage,
        schoolLogo,
        bannerTitle,
        bannerImage,
        bannerStats,
        aboutTitle,
        aboutDescription,
        aboutImage,
        description,
        contactAddress,
        contactPhone,
        contactEmail,
        facilities,
        campusImages,
        softSkills,
        classes,
        levelSelection,
        facebookUrl,
        twitterUrl,
        instagramUrl,
        linkedinUrl,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            address: true,
            phoneNumber: true,
            email: true,
            totalStudents: true,
            totalTeachers: true,
          }
        }
      }
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating school content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
