import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get recurring rules for the calendar
    const recurringRules = await prisma.recurringRule.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json(recurringRules);
  } catch (error) {
    console.error('Error fetching payment calendar:', error);
    return NextResponse.json({ error: 'Failed to fetch payment calendar' }, { status: 400 });
  }
}
