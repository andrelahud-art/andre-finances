# André Finances - Sistema Integral de Finanzas Personales

Aplicación web completa para gestión de finanzas personales con Next.js, React, Tailwind CSS, PostgreSQL y Supabase Auth.

## 🚀 Características

- ✅ **Autenticación** con registro e inicio de sesión
- ✅ **Dashboard** con KPIs principales
- ✅ **Transacciones** con filtros avanzados
- ✅ **Tarjetas de Crédito** con control de límites
- ✅ **Deudas a Largo Plazo** (préstamos, hipotecas)
- ✅ **Presupuestos** por categoría
- ✅ **Cuentas** (efectivo, banco, wallet)
- ✅ **Activos** con depreciación
- ✅ **Calendario de Pagos** recurrentes
- ✅ **Inversiones** tracking
- ✅ **Reportes** financieros
- ✅ **Autenticación de usuarios** con Supabase
- ✅ **Registro de usuarios**
- ✅ **Datos aislados por usuario**

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, Tailwind CSS, TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React
- **Deploy**: Vercel

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (ver SUPABASE_SETUP.md)
cp .env.example .env
# Editar .env con tus credenciales

# Generar cliente de Prisma
npx prisma generate
npx prisma migrate deploy  # Aplica las migraciones incluyendo el campo password

# Crear tablas en la base de datos
npx prisma db push

# Iniciar servidor de desarrollo
npm run dev
```

## 🔐 Configuración de Autenticación

**Ver [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** para instrucciones detalladas de configuración de Supabase.

### Variables de Entorno Requeridas

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
DIRECT_URL="postgresql://user:password@host:port/database?schema=public"

# Supabase (solo para autenticación)
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
```

## 🔑 API de Autenticación

### Registro de Usuario
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "name": "Nombre Usuario",
  "password": "contraseña123"
}
```

### Inicio de Sesión
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```
## 🔑 Uso

1. Regístrate en `/register` con tu email y contraseña
2. Inicia sesión en `/`
3. Accede al dashboard en `/dashboard`
4. Todos tus datos estarán asociados a tu cuenta de usuario

## 🚀 Deploy en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Deploy automático

### Variables de entorno en Vercel

Asegúrate de agregar todas las variables de `.env.example` en la configuración de Vercel.

## 🏗️ Arquitectura

- **Autenticación**: Manejada por Supabase Auth (JWT, cookies, sesiones)
- **Base de datos**: PostgreSQL con Prisma ORM
- **Usuarios**: Sincronizados entre Supabase Auth y tabla `User` de Prisma
- **Datos**: Aislados por `userId`, cada usuario solo ve sus propios datos

## 📝 Licencia

MIT
