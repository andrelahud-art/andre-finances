import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/api-utils';

export async function GET() {
  try {
    const user = await getOrCreateUser();

    // TODO: Fix Prisma client recognition of DebtSchedule model
    const schedules = await (prisma as any).debtSchedule.findMany({
      where: {
        debt: {
          userId: user.id,
        },
      },
      include: {
        debt: {
          select: {
            id: true,
            name: true,
            principal: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching payment calendar:', error);
    return NextResponse.json({ error: 'Failed to fetch payment calendar' }, { status: 400 });
  }
}
