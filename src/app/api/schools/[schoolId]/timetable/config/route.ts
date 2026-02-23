import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Resolve school ID from subdomain or UUID
 */
async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
    // Try as UUID first
    let school = await prisma.school.findUnique({
        where: { id: schoolIdentifier },
        select: { id: true }
    });

    // If not found, try as subdomain
    if (!school) {
        school = await prisma.school.findUnique({
            where: {
                subdomain: schoolIdentifier,
                isActive: true
            },
            select: { id: true }
        });
    }

    return school?.id || null;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: schoolIdentifier } = await params;

        // Resolve to actual school UUID
        const schoolId = await resolveSchoolId(schoolIdentifier);
        if (!schoolId) {
            return NextResponse.json(
                { error: 'School not found' },
                { status: 404 }
            );
        }

        const config = await prisma.timetableConfig.findUnique({
            where: { schoolId }
        });

        if (config) {
            const formatTime = (date: Date) => {
                return date.getHours().toString().padStart(2, '0') + ':' +
                    date.getMinutes().toString().padStart(2, '0');
            };

            // @ts-ignore - we're transforming for the response
            config.schoolStartTime = formatTime(config.schoolStartTime as Date);
            // @ts-ignore
            config.schoolEndTime = formatTime(config.schoolEndTime as Date);
        }

        return NextResponse.json({ config });
    } catch (error) {
        console.error('Failed to fetch timetable config:', error);
        return NextResponse.json(
            { error: 'Failed to fetch configuration' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: schoolIdentifier } = await params;

        // Resolve to actual school UUID
        const schoolId = await resolveSchoolId(schoolIdentifier);
        if (!schoolId) {
            return NextResponse.json(
                { error: 'School not found' },
                { status: 404 }
            );
        }

        const body = await request.json();

        const {
            schoolStartTime,
            schoolEndTime,
            periodDuration,
            breaks,
            workingDays
        } = body;

        // Validation
        if (!schoolStartTime || !schoolEndTime || !periodDuration) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Helper to convert "HH:mm" to a DateTime object (using 1970-01-01 as base)
        const parseTime = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const date = new Date(1970, 0, 1, hours, minutes);
            return date;
        };

        const config = await prisma.timetableConfig.upsert({
            where: { schoolId },
            update: {
                schoolStartTime: parseTime(schoolStartTime),
                schoolEndTime: parseTime(schoolEndTime),
                periodDuration,
                breaks: breaks || [],
                workingDays: workingDays || ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
                updatedAt: new Date()
            },
            create: {
                schoolId,
                schoolStartTime: parseTime(schoolStartTime),
                schoolEndTime: parseTime(schoolEndTime),
                periodDuration,
                breaks: breaks || [],
                workingDays: workingDays || ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
            }
        });

        return NextResponse.json({ success: true, config });
    } catch (error: any) {
        console.error('Config save error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to save configuration' },
            { status: 500 }
        );
    }
}
