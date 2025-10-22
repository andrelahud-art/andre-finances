import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();

    const asset = await prisma.asset.create({
      data: {
        userId: user.id,
        name: body.name,
        type: body.type,
        purchaseDate: new Date(body.purchaseDate),
        originalCost: parseFloat(body.originalCost || body.purchasePrice),
        currentValue: parseFloat(body.currentValue || body.originalCost || body.purchasePrice),
        usefulLife: body.usefulLife ? parseInt(body.usefulLife) : null,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 400 });
  }
}
