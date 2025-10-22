# 🚀 PASOS FINALES PARA COMPLETAR LA MIGRACIÓN

## ✅ LO QUE YA ESTÁ LISTO:

1. ✅ App funcionando: https://andre-finances.lindy.site/dashboard
2. ✅ Base de datos PostgreSQL en Supabase
3. ✅ Tablas creadas en Supabase
4. ✅ Proyecto configurado en Vercel
5. ✅ Variables de entorno configuradas

## ❌ LO QUE FALTA:

1. ❌ Subir el código actualizado a GitHub
2. ❌ Vercel hará deploy automático
3. ❌ Ejecutar script de migración de datos

---

# 📋 OPCIÓN 1: SUBIR CÓDIGO A GITHUB (RECOMENDADO)

## Paso 1: Ir a tu repositorio de GitHub

Ve a: https://github.com/andrelahud-art/andre-financies

## Paso 2: Crear archivo package.json

1. Haz clic en "creating a new file"
2. Nombre del archivo: `package.json`
3. Pega este contenido:

```json
{
  "name": "andre-finances",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "@radix-ui/react-accordion": "^1.2.1",
    "@radix-ui/react-alert-dialog": "^1.1.2",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-popover": "^1.1.2",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.1",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-tooltip": "^1.1.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "framer-motion": "^11.11.11",
    "lucide-react": "^0.454.0",
    "next": "15.0.2",
    "next-auth": "^4.24.10",
    "next-themes": "^0.4.3",
    "react": "^19.0.0",
    "react-day-picker": "^9.2.1",
    "react-dom": "^19.0.0",
    "recharts": "^2.14.1",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.0.2",
    "postcss": "^8",
    "prisma": "^5.22.0",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

4. Haz clic en "Commit changes"

## Paso 3: Crear archivo prisma/schema.prisma

1. Haz clic en "Add file" → "Create new file"
2. Nombre del archivo: `prisma/schema.prisma`
3. Pega el contenido del archivo adjunto "prisma-schema.txt"
4. Haz clic en "Commit changes"

## Paso 4: Crear archivo app/api/migrate/route.ts

1. Haz clic en "Add file" → "Create new file"
2. Nombre del archivo: `app/api/migrate/route.ts`
3. Pega este contenido:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Create or get user
    let user = await prisma.user.findUnique({
      where: { email: 'andre@finances.com' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'andre@finances.com',
          name: 'André Lahud',
          password: 'password123'
        }
      });
    }

    // Migrate Accounts
    if (data.accounts && data.accounts.length > 0) {
      for (const account of data.accounts) {
        await prisma.account.upsert({
          where: { id: account.id },
          update: {
            name: account.name,
            type: account.type,
            balance: account.balance,
            isActive: account.isActive
          },
          create: {
            id: account.id,
            userId: user.id,
            name: account.name,
            type: account.type,
            balance: account.balance,
            isActive: account.isActive
          }
        });
      }
    }

    // Migrate Credit Cards
    if (data.creditCards && data.creditCards.length > 0) {
      for (const card of data.creditCards) {
        await prisma.creditCard.upsert({
          where: { id: card.id },
          update: {
            name: card.name,
            creditLimit: card.limit,
            currentBalance: card.balance,
            cutoffDay: card.cutoffDay,
            isActive: card.isActive
          },
          create: {
            id: card.id,
            userId: user.id,
            name: card.name,
            creditLimit: card.limit,
            currentBalance: card.balance,
            cutoffDay: card.cutoffDay,
            isActive: card.isActive
          }
        });
      }
    }

    // Migrate Categories
    if (data.categories && data.categories.length > 0) {
      for (const category of data.categories) {
        await prisma.category.upsert({
          where: { id: category.id },
          update: {
            name: category.name,
            type: category.type,
            color: category.color,
            icon: category.icon
          },
          create: {
            id: category.id,
            userId: user.id,
            name: category.name,
            type: category.type,
            color: category.color,
            icon: category.icon
          }
        });
      }
    }

    // Migrate Transactions
    if (data.transactions && data.transactions.length > 0) {
      for (const transaction of data.transactions) {
        await prisma.transaction.upsert({
          where: { id: transaction.id },
          update: {
            date: new Date(transaction.date),
            amount: transaction.amount,
            type: transaction.type,
            accountId: transaction.accountId || null,
            creditCardId: transaction.creditCardId || null,
            categoryId: transaction.categoryId || null,
            merchant: transaction.merchant,
            note: transaction.note,
            isInvestment: transaction.isInvestment || false
          },
          create: {
            id: transaction.id,
            userId: user.id,
            date: new Date(transaction.date),
            amount: transaction.amount,
            type: transaction.type,
            accountId: transaction.accountId || null,
            creditCardId: transaction.creditCardId || null,
            categoryId: transaction.categoryId || null,
            merchant: transaction.merchant,
            note: transaction.note,
            isInvestment: transaction.isInvestment || false
          }
        });
      }
    }

    // Migrate Debts
    if (data.debts && data.debts.length > 0) {
      for (const debt of data.debts) {
        await prisma.debt.upsert({
          where: { id: debt.id },
          update: {
            name: debt.name,
            type: debt.type,
            currentBalance: debt.currentBalance,
            originalAmount: debt.originalAmount,
            interestRate: debt.interestRate,
            monthlyPayment: debt.monthlyPayment,
            remainingMonths: debt.remainingMonths,
            startDate: new Date(debt.startDate),
            description: debt.description,
            isActive: debt.isActive
          },
          create: {
            id: debt.id,
            userId: user.id,
            name: debt.name,
            type: debt.type,
            currentBalance: debt.currentBalance,
            originalAmount: debt.originalAmount,
            interestRate: debt.interestRate,
            monthlyPayment: debt.monthlyPayment,
            remainingMonths: debt.remainingMonths,
            startDate: new Date(debt.startDate),
            description: debt.description,
            isActive: debt.isActive
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Data migrated successfully',
      userId: user.id
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

5. Haz clic en "Commit changes"

## Paso 5: Esperar el deploy de Vercel

Vercel detectará los cambios automáticamente y hará deploy (2-3 minutos).

## Paso 6: Ejecutar script de migración

Una vez que el deploy termine:

1. Ve a: https://andre-finances.lindy.site/dashboard
2. Abre la consola del navegador (F12)
3. Pega este código y presiona Enter:

```javascript
(async function() {
  console.log('🚀 Iniciando migración de datos a Supabase...');
  
  const data = {
    accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),
    creditCards: JSON.parse(localStorage.getItem('creditCards') || '[]'),
    categories: JSON.parse(localStorage.getItem('categories') || '[]'),
    transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
    debts: JSON.parse(localStorage.getItem('longTermDebts') || '[]'),
    assets: JSON.parse(localStorage.getItem('assets') || '[]'),
    budgets: JSON.parse(localStorage.getItem('budgets') || '[]'),
    recurringRules: JSON.parse(localStorage.getItem('calendarPayments') || '[]')
  };
  
  console.log('📊 Datos a migrar:', data);
  
  const response = await fetch('/api/migrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  console.log('✅ Resultado:', result);
  
  if (result.success) {
    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('🔍 Verifica en: https://supabase.com/dashboard/project/jdkrtnrhcyjtmbwtatsc/editor');
  }
})();
```

---

# 📋 OPCIÓN 2: SOLUCIÓN RÁPIDA (SI GITHUB NO FUNCIONA)

Si tienes problemas con GitHub, puedes:

1. Descargar el archivo comprimido: `/home/code/andre-finances/andre-finances.tar.gz`
2. Extraerlo en tu computadora local
3. Subir los archivos manualmente a GitHub desde tu computadora

---

# ✅ VERIFICACIÓN FINAL

Una vez completada la migración:

1. Ve a Supabase: https://supabase.com/dashboard/project/jdkrtnrhcyjtmbwtatsc/editor
2. Verifica que las tablas tengan datos
3. Abre tu app desde otro dispositivo
4. Verifica que los datos se cargan correctamente

¡LISTO! 🎉
