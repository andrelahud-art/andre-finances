import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const startDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = to ? new Date(to) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    const dailyFlows: { [key: string]: number } = {};

    transactions.forEach((tx) => {
      const dateStr = tx.date.toISOString().split('T')[0];
      const amount = tx.type === 'INCOME' ? Number(tx.amount) : -Number(tx.amount);
      dailyFlows[dateStr] = (dailyFlows[dateStr] || 0) + amount;
    });

    const series = Object.entries(dailyFlows).map(([date, amount]) => ({
      date,
      amount,
    }));

    return NextResponse.json({ series });
  } catch (error) {
    console.error('Error calculating cash flow:', error);
    return NextResponse.json({ error: 'Failed to calculate cash flow' }, { status: 400 });
  }
}
