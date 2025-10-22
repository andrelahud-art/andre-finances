# Configuración de Supabase para André Finance

Este proyecto usa Supabase únicamente para autenticación de usuarios. La base de datos sigue siendo PostgreSQL con Prisma (puede ser la misma base de datos de Supabase u otra).

## Paso 1: Crear un proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta (si no tienes una)
2. Crea un nuevo proyecto
3. Guarda tu contraseña de base de datos (la necesitarás después)

## Paso 2: Obtener las credenciales de Supabase

1. En el dashboard de tu proyecto de Supabase, ve a **Settings** > **API**
2. Copia las siguientes credenciales:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Paso 3: Configurar las variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto (si no existe)
2. Copia el contenido de `.env.example` y completa las credenciales:

```env
# Database (puede ser Supabase u otro PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
DIRECT_URL="postgresql://user:password@host:port/database?schema=public"

# Supabase (para autenticación)
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
```

### Opción A: Usar la base de datos de Supabase para todo

Si quieres usar la base de datos de Supabase para todo (recomendado para simplificar):

1. En Supabase, ve a **Settings** > **Database**
2. Copia la **Connection String** (URI)
3. Usa esta URL tanto para `DATABASE_URL` como para `DIRECT_URL`

### Opción B: Usar bases de datos separadas

Puedes usar Supabase solo para auth y otra base de datos PostgreSQL para los datos:

1. Usa las credenciales de tu base de datos PostgreSQL existente para `DATABASE_URL`
2. Usa las credenciales de Supabase solo para `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Paso 4: Configurar Supabase Auth

1. En Supabase, ve a **Authentication** > **Providers**
2. Asegúrate de que **Email** esté habilitado
3. (Opcional) Desactiva la confirmación de email en **Authentication** > **Settings** > **Email Auth** > **Enable email confirmations** (para desarrollo)

## Paso 5: Inicializar la base de datos

```bash
# Instalar dependencias
npm install

# Generar el cliente de Prisma
npx prisma generate

# Crear las tablas en la base de datos
npx prisma db push
```

## Paso 6: Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Flujo de Autenticación

1. **Registro**: Los usuarios se registran en `/register`
   - Supabase crea el usuario en Auth
   - El sistema sincroniza el usuario a la tabla `User` en la base de datos

2. **Login**: Los usuarios inician sesión en `/`
   - Supabase valida las credenciales
   - El sistema crea una sesión

3. **Datos del usuario**: Todos los datos (transacciones, cuentas, etc.) se asocian al `userId` de Supabase

## Importante: Seguridad

- Las claves `NEXT_PUBLIC_*` son públicas y se envían al cliente
- **NO** uses `service_role_key` en el frontend
- Supabase maneja las contraseñas de forma segura (nunca se almacenan en tu base de datos)

## Solución de problemas

### Error: "No autenticado"
- Verifica que las credenciales de Supabase estén correctamente configuradas
- Asegúrate de que el usuario esté registrado
- Revisa que la sesión esté activa (cookies)

### Error al conectar a la base de datos
- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que la base de datos esté accesible
- Ejecuta `npx prisma db push` para crear las tablas

### Error: "User already exists"
- El email ya está registrado en Supabase
- Usa un email diferente o inicia sesión con el existente

## Notas adicionales

- Supabase Auth y la tabla `User` de Prisma usan el mismo `id` (UUID de Supabase)
- La contraseña en la tabla `User` está vacía porque Supabase la maneja
- Puedes extender los metadatos del usuario en Supabase (`user_metadata`)
