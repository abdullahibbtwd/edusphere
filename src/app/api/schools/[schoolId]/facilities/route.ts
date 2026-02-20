import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';

// GET - Fetch school facilities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;

    const facilities = await db.schoolFacility.findMany({
      where: {
        schoolId,
        isActive: true
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(facilities);
  } catch (error) {
    console.error('Error fetching school facilities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new facility
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const body = await request.json();

    const { name, imageUrl, description, order } = body;

    if (!name) {
      return NextResponse.json({ error: 'Facility name is required' }, { status: 400 });
    }

    const facility = await db.schoolFacility.create({
      data: {
        schoolId,
        name,
        imageUrl,
        description,
        order: order || 0,
      }
    });

    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error creating facility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update facility
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const body = await request.json();

    const { id, name, imageUrl, description, order, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 });
    }

    const facility = await db.schoolFacility.update({
      where: {
        id,
        schoolId // Ensure the facility belongs to this school
      },
      data: {
        name,
        imageUrl,
        description,
        order,
        isActive,
      }
    });

    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error updating facility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete facility
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('id');

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 });
    }

    await db.schoolFacility.delete({
      where: {
        id: facilityId,
        schoolId // Ensure the facility belongs to this school
      }
    });

    return NextResponse.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    console.error('Error deleting facility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
