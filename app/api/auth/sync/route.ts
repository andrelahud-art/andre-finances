import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id, email, name } = await request.json();

    // Sync or create user in database
    const dbUser = await prisma.user.upsert({
      where: { id: id || user.id },
      update: {
        email: email || user.email!,
        name: name || user.user_metadata?.name || user.email?.split('@')[0],
      },
      create: {
        id: id || user.id,
        email: email || user.email!,
        name: name || user.user_metadata?.name || user.email?.split('@')[0],
        password: '', // Password managed by Supabase
      },
    });

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Error al sincronizar usuario' },
      { status: 500 }
    );
  }
}
