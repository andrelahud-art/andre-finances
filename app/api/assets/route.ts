import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/api-utils';

export async function GET() {
  try {
    const user = await getOrCreateUser();

    const assets = await prisma.asset.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const body = await request.json();

    const asset = await prisma.asset.create({
      data: {
        userId: user.id,
        name: body.name,
        type: body.type,
        purchaseDate: new Date(body.purchaseDate),
        originalCost: parseFloat(body.purchasePrice),
        currentValue: parseFloat(body.purchasePrice),
        usefulLife: parseInt(body.usefulLife) || 5,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 400 });
  }
}
