import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/api-utils';

export async function GET() {
  try {
    const user = await getOrCreateUser();

    // TODO: Fix Prisma client recognition of InventoryItem model
    const inventory = await (prisma as any).inventoryItem.findMany({
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

    // TODO: Fix Prisma client recognition of InventoryItem model
    const item = await (prisma as any).inventoryItem.create({
      data: {
        userId: user.id,
        sku: body.sku,
        name: body.name,
        quantity: parseInt(body.quantity),
        costAverage: parseFloat(body.unitCost),
        valuationMethod: body.valuationMethod || 'AVERAGE',
        type: 'PRODUCT',
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 400 });
  }
}
