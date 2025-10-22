import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validar credenciales hardcodeadas
    if (email !== 'andre' || password !== 'pigopigo') {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar token simple (en producción usar JWT)
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      token,
      user: {
        id: 'user_andre',
        email: 'andre@finance.local',
        name: 'André'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
