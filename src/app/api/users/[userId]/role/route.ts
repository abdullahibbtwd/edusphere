import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-middleware';

/**
 * PATCH /api/users/[userId]/role
 * Update user role
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    // Check authentication
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Only SUPER_ADMIN can change roles
    if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
            { error: 'Forbidden - Super Admin access required' },
            { status: 403 }
        );
    }

    try {
        const { userId } = params;
        const body = await request.json();
        const { role } = body;

        // Validate role
        const validRoles = ['USER', 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'];
        if (!role || !validRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role. Must be one of: ' + validRoles.join(', ') },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Prevent user from changing their own role
        if (userId === user.userId) {
            return NextResponse.json(
                { error: 'You cannot change your own role' },
                { status: 400 }
            );
        }

        // Update user role
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                imageUrl: true,
                schoolId: true,
                school: {
                    select: {
                        id: true,
                        name: true,
                        subdomain: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'User role updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json(
            { error: 'Failed to update user role' },
            { status: 500 }
        );
    }
}
