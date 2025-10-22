import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function getOrCreateUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        name: 'André',
      },
    });
  }
  return user;
}

export async function GET(_request: NextRequest) {
  try {
    const user = await getOrCreateUser();

    const schedules = await prisma.debtSchedule.findMany({
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
