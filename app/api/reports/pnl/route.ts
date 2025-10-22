import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
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
      if (tx.type === 'INCOME') income += amount;
      else if (tx.type === 'EXPENSE') {
        // Categorize expenses
        if (tx.category?.type === 'EXPENSE') {
          opex += Math.abs(amount);
        }
      }
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
