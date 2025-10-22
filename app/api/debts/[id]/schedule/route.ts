import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const schedules = await prisma.debtSchedule.findMany({
      where: { debtId: id },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching debt schedule:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 400 });
  }
}
