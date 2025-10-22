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
      if (tx.category?.kind === 'INCOME') income += amount;
      else if (tx.category?.kind === 'COGS') cogs += amount;
      else if (tx.category?.kind === 'OPEX') opex += amount;
      else if (tx.category?.kind === 'INTEREST') interest += amount;
      else if (tx.category?.kind === 'TAX') tax += amount;
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
