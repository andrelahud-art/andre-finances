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

export async function GET(_request: NextRequest) {
  try {
    const user = await getOrCreateUser();

    const inventory = await prisma.inventoryItem.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const body = await request.json();

    const item = await prisma.inventoryItem.create({
      data: {
        userId: user.id,
        sku: body.sku,
        name: body.name,
        quantity: parseInt(body.quantity),
        unitCost: parseFloat(body.unitCost),
        valuationMethod: body.valuationMethod || 'FIFO',
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 400 });
  }
}
