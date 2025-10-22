import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const debtSchema = z.object({
  name: z.string(),
  principal: z.number(),
  rateAnnual: z.number(),
  startDate: z.string().or(z.date()),
  termMonths: z.number(),
  accountId: z.string(),
});

import { getCurrentUser } from '@/lib/auth-helpers';

function buildFrenchSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  start: Date
) {
  const r = annualRate / 12 / 100;
  const payment = principal * (r / (1 - Math.pow(1 + r, -termMonths)));
  const rows = [];
  let balance = principal;

  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * r;
    const principalDue = payment - interest;
    balance = Math.max(0, balance - principalDue);
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + i);
    rows.push({
      dueDate,
      principalDue: Math.round(principalDue * 100) / 100,
      interestDue: Math.round(interest * 100) / 100,
      totalDue: Math.round(payment * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const data = debtSchema.parse(body);

    const debt = await prisma.debt.create({
      data: {
        name: data.name,
        principal: data.principal,
        rateAnnual: data.rateAnnual,
        startDate: new Date(data.startDate),
        termMonths: data.termMonths,
        accountId: data.accountId,
        userId: user.id,
      },
    });

    const schedule = buildFrenchSchedule(
      data.principal,
      data.rateAnnual,
      data.termMonths,
      new Date(data.startDate)
    );

    await Promise.all(
      schedule.map((row) =>
        prisma.debtSchedule.create({
          data: {
            debtId: debt.id,
            dueDate: row.dueDate,
            principalDue: row.principalDue,
            interestDue: row.interestDue,
            totalDue: row.totalDue,
            status: 'DUE',
          },
        })
      )
    );

    const debtWithSchedule = await prisma.debt.findUnique({
      where: { id: debt.id },
      include: { schedules: true },
    });

    return NextResponse.json({ debt: debtWithSchedule }, { status: 201 });
  } catch (error) {
    console.error('Error creating debt:', error);
    return NextResponse.json({ error: 'Failed to create debt' }, { status: 400 });
  }
}

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const debts = await prisma.debt.findMany({
      where: { userId: user.id },
      include: {
        schedules: {
          orderBy: { dueDate: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(debts);
  } catch (error) {
    console.error('Error fetching debts:', error);
    return NextResponse.json({ error: 'Failed to fetch debts' }, { status: 400 });
  }
}
