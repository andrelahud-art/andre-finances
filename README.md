# André Finances - Sistema Integral de Finanzas Personales

Aplicación web completa para gestión de finanzas personales con Next.js, React, Tailwind CSS y PostgreSQL.

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

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, Tailwind CSS, TypeScript
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Iconos**: Lucide React
- **Deploy**: Vercel

## 📦 Instalación

```bash
npm install
npx prisma generate
npx prisma migrate deploy  # Aplica las migraciones incluyendo el campo password
npm run dev
```

## 🔐 Variables de Entorno

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"
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

## 🚀 Deploy en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático

## 📝 Licencia

MIT
