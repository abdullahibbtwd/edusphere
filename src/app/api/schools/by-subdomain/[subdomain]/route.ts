import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// GET - Fetch school data by subdomain
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;

    const school = await db.school.findUnique({
      where: { 
        subdomain,
        isActive: true 
      },
      include: {
        content: true,
        levels: {
          where: { isActive: true },
          include: {
            classes: {
              orderBy: { name: 'asc' }
            }
          },
          orderBy: { name: 'asc' }
        },
        subjects: {
          orderBy: { name: 'asc' }
        },
        students: {
          select: { id: true }
        }
      }
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json(school);
  } catch (error) {
    console.error('Error fetching school by subdomain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
