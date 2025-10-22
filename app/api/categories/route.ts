import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string(),
  kind: z.enum(['INCOME', 'COGS', 'OPEX', 'TAX', 'INTEREST', 'TRANSFER']),
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
    const data = categorySchema.parse(body);
    const user = await getOrCreateUser();

    const category = await prisma.category.create({
      data: {
        name: data.name,
        kind: data.kind,
        userId: user.id,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();

    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 400 });
  }
}
