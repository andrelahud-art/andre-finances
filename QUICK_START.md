# 🚀 Inicio Rápido - André Finance con Autenticación

## ¿Qué se implementó?

Ahora André Finance tiene **registro e inicio de sesión de usuarios** con Supabase. Cada usuario tiene sus propios datos completamente aislados.

## ⚡ Configuración en 5 Minutos

### 1. Crear proyecto Supabase (2 min)

1. Ve a [supabase.com](https://supabase.com) y crea cuenta
2. Click en "New Project"
3. Dale un nombre: `andre-finances`
4. Guarda la contraseña de base de datos (la necesitarás)
5. Espera ~2 minutos a que se cree

### 2. Obtener credenciales (1 min)

En tu proyecto de Supabase:

1. Ve a **Settings** (⚙️ abajo a la izquierda)
2. Click en **API**
3. Copia:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon/public key** (ej: `eyJhbGc...`)

### 3. Configurar proyecto (2 min)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env
cp .env.example .env

# 3. Editar .env con tus credenciales
```

Edita `.env`:
```env
# Opción A: Usar base de datos de Supabase (recomendado)
DATABASE_URL="postgresql://postgres:[TU-CONTRASEÑA]@db.[TU-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[TU-CONTRASEÑA]@db.[TU-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
```

**Obtener cadena de conexión PostgreSQL**:
- En Supabase: **Settings** > **Database** > **Connection string** > **URI**
- Reemplaza `[YOUR-PASSWORD]` con tu contraseña

```bash
# 4. Inicializar base de datos
npx prisma generate
npx prisma db push

# 5. Iniciar servidor
npm run dev
```

### 4. ¡Listo! 🎉

Abre http://localhost:3000 y:

1. Click en "Regístrate aquí"
2. Crea tu cuenta
3. ¡Empieza a usar la app!

---

## 📱 Flujo de Usuario

### Primera vez (Registro)

```
http://localhost:3000
        ↓
Click "Regístrate aquí"
        ↓
/register
        ↓
Completa formulario:
- Email: tu@email.com
- Contraseña: (mínimo 6 caracteres)
- Confirmar contraseña
- Nombre (opcional)
        ↓
Click "Crear Cuenta"
        ↓
¡Cuenta creada! ✓
        ↓
Redirige a login
        ↓
Inicia sesión
        ↓
Dashboard (/dashboard)
```

### Usuarios existentes (Login)

```
http://localhost:3000
        ↓
Ingresa email y contraseña
        ↓
Click "Iniciar Sesión"
        ↓
Dashboard (/dashboard)
```

---

## 🎯 Características Principales

### ✅ Autenticación Completa
- Registro de usuarios
- Login seguro
- Logout
- Sesiones persistentes

### ✅ Datos Aislados
- Cada usuario solo ve sus datos
- Cuentas separadas por usuario
- Transacciones separadas por usuario
- Todo aislado automáticamente

### ✅ Seguridad
- Contraseñas encriptadas (bcrypt)
- Sesiones con cookies seguras
- Rutas protegidas automáticamente
- API protegida (401 sin auth)

---

## 🛠️ Estructura de Archivos

```
andre-finances/
├── app/
│   ├── page.tsx                    # Login
│   ├── register/
│   │   └── page.tsx               # Registro (NUEVO)
│   ├── dashboard/
│   │   └── page.tsx               # Dashboard (ACTUALIZADO)
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts     # Endpoint login
│       │   ├── register/route.ts  # Endpoint registro (NUEVO)
│       │   └── sync/route.ts      # Sincronización (NUEVO)
│       ├── transactions/route.ts  # Filtrado por usuario
│       ├── accounts/route.ts      # Filtrado por usuario
│       └── ...                    # Todos filtrados por usuario
├── lib/
│   ├── supabase.ts               # Cliente Supabase (NUEVO)
│   ├── supabase-server.ts        # Cliente servidor (NUEVO)
│   ├── auth.ts                   # Funciones auth (NUEVO)
│   └── auth-helpers.ts           # Helpers (NUEVO)
├── middleware.ts                 # Protección rutas (NUEVO)
├── .env.example                  # Template env vars
├── SUPABASE_SETUP.md            # Guía setup completa
├── IMPLEMENTATION_SUMMARY.md     # Resumen técnico
├── TEST_CHECKLIST.md            # Lista de pruebas
└── QUICK_START.md               # Esta guía
```

---

## 🧪 Probar que Funciona

### Prueba Básica (2 min)

1. **Registrar usuario**:
   ```
   http://localhost:3000/register
   Email: test@example.com
   Password: test123
   ```

2. **Iniciar sesión**:
   ```
   http://localhost:3000
   Email: test@example.com
   Password: test123
   ```

3. **Crear cuenta**:
   ```
   Dashboard > Cuentas > + Nueva Cuenta
   Nombre: Mi Cuenta
   Tipo: Banco
   Balance: 1000
   ```

4. **Crear transacción**:
   ```
   Dashboard > Transacciones > + Nueva
   Tipo: Gasto
   Monto: 50
   Cuenta: Mi Cuenta
   ```

5. **Verificar aislamiento**:
   ```
   - Cerrar sesión
   - Registrar otro usuario (test2@example.com)
   - Iniciar sesión
   - Verificar que NO aparecen datos del primer usuario
   ```

**✅ Si todo funciona**: ¡Estás listo!

Para pruebas más detalladas, ver [`TEST_CHECKLIST.md`](./TEST_CHECKLIST.md)

---

## ❓ Problemas Comunes

### Error: "Invalid login credentials"
**Solución**: Verifica email y contraseña, o crea cuenta primero

### Error: "No autenticado"
**Solución**: Inicia sesión primero

### Error: Supabase connection
**Solución**: Verifica `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env`

### Error: Database connection
**Solución**: Verifica `DATABASE_URL` en `.env` y ejecuta `npx prisma db push`

### Página en blanco
**Solución**:
1. Verifica logs en la consola
2. Verifica que todas las variables de entorno están configuradas
3. Ejecuta `npx prisma generate`

---

## 📚 Más Información

- **Setup completo**: [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
- **Resumen técnico**: [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md)
- **Testing completo**: [`TEST_CHECKLIST.md`](./TEST_CHECKLIST.md)
- **Docs Supabase**: https://supabase.com/docs
- **Docs Prisma**: https://www.prisma.io/docs

---

## 🚀 Deploy a Producción

### Vercel

1. Push tu código a GitHub
2. Conecta repo en Vercel
3. Agrega variables de entorno en Vercel:
   ```
   DATABASE_URL
   DIRECT_URL
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
4. Deploy ✓

### Netlify (similar)

1. Conecta repo
2. Agrega variables de entorno
3. Deploy ✓

---

## 💡 Tips

- **Usar misma DB**: Puedes usar la base de datos de Supabase para todo (recomendado)
- **OAuth**: Supabase soporta Google, GitHub, etc. (ver docs)
- **Resetear**: Para empezar de cero, elimina usuarios en Supabase Dashboard
- **Backup**: Supabase hace backups automáticos de tu DB

---

## ✨ ¿Qué Cambió?

### Antes
- ❌ Sin registro de usuarios
- ❌ Credenciales hardcodeadas
- ❌ Todos comparten los mismos datos
- ❌ Sin seguridad real

### Ahora
- ✅ Registro completo de usuarios
- ✅ Autenticación con Supabase
- ✅ Cada usuario tiene sus propios datos
- ✅ Seguridad profesional con bcrypt

---

**¿Necesitas ayuda?** Ver documentación completa en:
- [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
- [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md)

**¡Disfruta tu app con autenticación real!** 🎉
