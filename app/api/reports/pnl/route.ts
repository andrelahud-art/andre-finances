import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || new Date().toISOString().slice(0, 7);

    const [year, month] = period.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { category: true },
    });

    let income = 0,
      cogs = 0,
      opex = 0,
      interest = 0,
      tax = 0;

    transactions.forEach((tx) => {
      const amount = Number(tx.amount);
      if (tx.category?.type === 'INCOME') income += amount;
      else if (tx.category?.type === 'COGS') cogs += amount;
      else if (tx.category?.type === 'OPEX') opex += amount;
      else if (tx.category?.type === 'INTEREST') interest += amount;
      else if (tx.category?.type === 'TAX') tax += amount;
    });

    const netIncome = income - cogs - opex - interest - tax;

    return NextResponse.json({
      period,
      income,
      cogs,
      opex,
      interest,
      tax,
      netIncome,
    });
  } catch (error) {
    console.error('Error calculating P&L:', error);
    return NextResponse.json({ error: 'Failed to calculate P&L' }, { status: 400 });
  }
}
