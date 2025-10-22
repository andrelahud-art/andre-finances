import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export async function POST(request: NextRequest) {
  try {
    await request.json().catch(() => ({}));

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
  } catch (err: unknown) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}
