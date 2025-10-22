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
        purchasePrice: parseFloat(body.purchasePrice),
        depreciationMethod: body.depreciationMethod || 'STRAIGHT_LINE',
        usefulLife: parseInt(body.usefulLife) || 5,
        salvageValue: parseFloat(body.salvageValue) || 0,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 400 });
  }
}
