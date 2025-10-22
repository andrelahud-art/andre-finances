import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const transactionSchema = z.object({
  date: z.string().or(z.date()),
  amount: z.number(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT']),
  accountId: z.string(),
  categoryId: z.string().optional(),
  note: z.string().optional(),
});

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = transactionSchema.parse(body);
    const user = await getOrCreateUser();

    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(data.date),
        amount: data.amount,
        type: data.type,
        accountId: data.accountId,
        categoryId: data.categoryId,
        note: data.note,
        userId: user.id,
      },
      include: {
        account: true,
        category: true,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: user.id },
        include: {
          account: true,
          category: true,
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 400 });
  }
}
