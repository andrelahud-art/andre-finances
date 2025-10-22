import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';
import { z } from 'zod';

const accountSchema = z.object({
  name: z.string(),
  type: z.string(),
  currency: z.string().optional(),
  balance: z.string().or(z.number()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const data = accountSchema.parse(body);

    const account = await prisma.account.create({
      data: {
        name: data.name,
        type: data.type,
        currency: data.currency || 'MXN',
        balance: data.balance ? (typeof data.balance === 'string' ? parseFloat(data.balance) : data.balance) : 0,
        userId: user.id,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 400 });
  }
}

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 400 });
  }
}
