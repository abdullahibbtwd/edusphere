import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';

// GET - Fetch school campuses
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;

    const campuses = await db.schoolCampus.findMany({
      where: {
        schoolId,
        isActive: true
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(campuses);
  } catch (error) {
    console.error('Error fetching school campuses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new campus image
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const body = await request.json();

    const { title, imageUrl, description, order } = body;

    if (!title) {
      return NextResponse.json({ error: 'Campus title is required' }, { status: 400 });
    }

    const campus = await db.schoolCampus.create({
      data: {
        schoolId,
        title,
        imageUrl,
        description,
        order: order || 0,
      }
    });

    return NextResponse.json(campus);
  } catch (error) {
    console.error('Error creating campus:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update campus
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const body = await request.json();

    const { id, title, imageUrl, description, order, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Campus ID is required' }, { status: 400 });
    }

    const campus = await db.schoolCampus.update({
      where: {
        id,
        schoolId // Ensure the campus belongs to this school
      },
      data: {
        title,
        imageUrl,
        description,
        order,
        isActive,
      }
    });

    return NextResponse.json(campus);
  } catch (error) {
    console.error('Error updating campus:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete campus
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get('id');

    if (!campusId) {
      return NextResponse.json({ error: 'Campus ID is required' }, { status: 400 });
    }

    await db.schoolCampus.delete({
      where: {
        id: campusId,
        schoolId // Ensure the campus belongs to this school
      }
    });

    return NextResponse.json({ message: 'Campus deleted successfully' });
  } catch (error) {
    console.error('Error deleting campus:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
