import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export async function POST(request: NextRequest) {
  try {
    const data = await request.json().catch(() => ({}));

    // Create or get user
    let user = await prisma.user.findUnique({
      where: { email: 'andre@finances.com' },
  });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'andre@finances.com',
          name: 'André Lahud',
        },
      });
    }

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
