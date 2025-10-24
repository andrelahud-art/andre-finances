import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { DEFAULT_USER_ID } from '@/lib/constants';

const transactionSchema = z.object({
  date: z.string().or(z.date()),
  amount: z.number(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT']),
  accountId: z.string(),
  categoryId: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = transactionSchema.parse(body);
    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId: DEFAULT_USER_ID,
      },
    });
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: DEFAULT_USER_ID,
      },
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
