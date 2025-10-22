import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'El nombre es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = registerSchema.parse(body);

    const supabase = await createClient();

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Create user in database
    if (data.user) {
      try {
        await prisma.user.create({
          data: {
            id: data.user.id,
            email: data.user.email!,
            name: name || email.split('@')[0],
            password: '', // Password managed by Supabase
          },
        });
      } catch (dbError: any) {
        // User might already exist, that's ok
        console.log('User already exists in database:', dbError.message);
      }
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
