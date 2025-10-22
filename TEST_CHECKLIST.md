# Lista de Verificación para Probar la Autenticación

## ✅ Pre-requisitos

Antes de probar, asegúrate de tener:

- [ ] Proyecto de Supabase creado
- [ ] Variables de entorno configuradas en `.env`:
  ```env
  DATABASE_URL="postgresql://..."
  DIRECT_URL="postgresql://..."
  NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
  NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
  ```
- [ ] Dependencias instaladas: `npm install`
- [ ] Base de datos inicializada: `npx prisma generate && npx prisma db push`
- [ ] Servidor corriendo: `npm run dev`

## 🧪 Pruebas de Autenticación

### 1. Registro de Usuario Nuevo

- [ ] Ir a http://localhost:3000/register
- [ ] Completar formulario:
  - Email: `test@example.com`
  - Contraseña: `test123` (mínimo 6 caracteres)
  - Confirmar contraseña: `test123`
  - Nombre (opcional): `Usuario Test`
- [ ] Click en "Crear Cuenta"
- [ ] Verificar mensaje de éxito
- [ ] Verificar redirección a login

**Resultado esperado**: 
- ✅ Usuario creado en Supabase Auth
- ✅ Usuario sincronizado en tabla `User` de la base de datos
- ✅ Mensaje de éxito mostrado
- ✅ Redirección a `/` después de 2 segundos

### 2. Inicio de Sesión

- [ ] En http://localhost:3000/ (login)
- [ ] Ingresar credenciales:
  - Email: `test@example.com`
  - Contraseña: `test123`
- [ ] Click en "Iniciar Sesión"
- [ ] Verificar redirección a `/dashboard`

**Resultado esperado**:
- ✅ Login exitoso
- ✅ Cookie de sesión creada
- ✅ Redirección a dashboard
- ✅ Usuario mostrado en header del dashboard

### 3. Protección de Rutas

- [ ] Con sesión activa, intentar ir a `/` (login)
- [ ] Verificar redirección automática a `/dashboard`
- [ ] Cerrar sesión desde el dashboard
- [ ] Intentar acceder a `/dashboard` sin sesión
- [ ] Verificar redirección automática a `/` (login)

**Resultado esperado**:
- ✅ Usuario logueado no puede acceder a login
- ✅ Usuario sin sesión no puede acceder a dashboard
- ✅ Redirecciones automáticas funcionan

### 4. Crear Datos de Usuario

Con sesión activa en `/dashboard`:

#### 4.1 Crear Cuenta
- [ ] Click en "Cuentas" en el sidebar
- [ ] Click en "+ Nueva Cuenta"
- [ ] Completar formulario:
  - Nombre: `Cuenta Test`
  - Tipo: `Banco`
  - Balance: `1000`
- [ ] Guardar
- [ ] Verificar que la cuenta aparece en la lista

#### 4.2 Crear Categoría
- [ ] Crear una categoría de gastos
- [ ] Verificar que aparece en la lista

#### 4.3 Crear Transacción
- [ ] Click en "Transacciones" en el sidebar
- [ ] Click en "+ Nueva"
- [ ] Completar formulario:
  - Tipo: `Gasto`
  - Fecha: Hoy
  - Monto: `50`
  - Cuenta: Seleccionar la cuenta creada
  - Categoría: Seleccionar categoría creada
  - Nota: `Prueba de transacción`
- [ ] Guardar
- [ ] Verificar que aparece en la lista

**Resultado esperado**:
- ✅ Todos los datos se crean correctamente
- ✅ Los datos son visibles inmediatamente
- ✅ El balance de la cuenta se actualiza

### 5. Aislamiento de Datos entre Usuarios

#### 5.1 Crear Segundo Usuario
- [ ] Cerrar sesión
- [ ] Ir a `/register`
- [ ] Crear nuevo usuario: `test2@example.com` / `test456`
- [ ] Iniciar sesión con el nuevo usuario

#### 5.2 Verificar Aislamiento
- [ ] Ir a Dashboard
- [ ] Verificar que NO aparecen datos del primer usuario
- [ ] Crear una cuenta para este usuario
- [ ] Verificar que solo aparece su propia cuenta

#### 5.3 Volver al Primer Usuario
- [ ] Cerrar sesión
- [ ] Iniciar sesión con `test@example.com` / `test123`
- [ ] Verificar que solo aparecen sus datos
- [ ] Verificar que NO aparecen datos del segundo usuario

**Resultado esperado**:
- ✅ Cada usuario solo ve sus propios datos
- ✅ Total aislamiento entre usuarios
- ✅ Los datos no se mezclan

### 6. API Endpoints

Usando Postman, curl o similar:

#### 6.1 Sin Autenticación
```bash
# Debe retornar 401
curl http://localhost:3000/api/accounts
```

#### 6.2 Con Autenticación
```bash
# 1. Login para obtener cookie
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 2. Obtener cuentas (debe retornar las del usuario)
curl -b cookies.txt http://localhost:3000/api/accounts
```

**Resultado esperado**:
- ✅ Sin sesión: 401 Unauthorized
- ✅ Con sesión: Datos del usuario autenticado

### 7. Cerrar Sesión

- [ ] En dashboard, click en "Cerrar Sesión"
- [ ] Verificar redirección a login
- [ ] Intentar acceder a `/dashboard`
- [ ] Verificar que redirige a login

**Resultado esperado**:
- ✅ Sesión cerrada correctamente
- ✅ Cookie eliminada
- ✅ Ya no puede acceder a rutas protegidas

## 🐛 Errores Comunes y Soluciones

### Error: "Invalid login credentials"
**Causa**: Credenciales incorrectas o usuario no existe
**Solución**: Verificar email y contraseña, o crear cuenta

### Error: "No autenticado" en API
**Causa**: No hay sesión activa
**Solución**: Iniciar sesión primero

### Error: Supabase connection failed
**Causa**: Variables de entorno incorrectas
**Solución**: Verificar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Error: Database connection error
**Causa**: `DATABASE_URL` incorrecta
**Solución**: Verificar cadena de conexión y ejecutar `npx prisma db push`

### Página en blanco o error 500
**Causa**: Configuración incompleta
**Solución**: 
1. Verificar logs del servidor
2. Verificar variables de entorno
3. Verificar que Prisma está generado: `npx prisma generate`

## ✅ Checklist Final

Después de completar todas las pruebas:

- [ ] Registro de usuarios funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Protección de rutas funciona
- [ ] Crear datos funciona
- [ ] Aislamiento entre usuarios funciona
- [ ] API retorna 401 sin autenticación
- [ ] API retorna datos con autenticación

Si todas las pruebas pasan: **¡La implementación está lista para producción!** 🎉

## 📝 Notas

- Los datos de prueba pueden eliminarse desde Supabase Dashboard > Authentication > Users
- Para resetear todo: eliminar usuarios en Supabase y ejecutar `npx prisma db push --force-reset`
- En producción, configurar las mismas variables de entorno en Vercel/Netlify
