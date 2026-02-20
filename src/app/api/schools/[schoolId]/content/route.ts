import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';

// GET - Fetch school content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;

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
  try {
    const { schoolId } = await params;
    const body = await request.json();

    // Debug logging
    console.log('Received classes data:', body.classes);
    console.log('School ID:', schoolId);

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

    // Update or create school content
    console.log('Saving classes to database:', classes);
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

    console.log('Saved content with classes:', content.classes);
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating school content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
