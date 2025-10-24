import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { DEFAULT_USER_ID } from '@/lib/constants';

const accountSchema = z.object({
  name: z.string(),
  type: z.string(),
  currency: z.string().optional(),
  balance: z.string().or(z.number()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = accountSchema.parse(body);
    const account = await prisma.account.create({
      data: {
        ...data,
        userId: DEFAULT_USER_ID,
      },
    });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        userId: DEFAULT_USER_ID,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(accounts, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
