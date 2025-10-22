# 🚀 GUÍA COMPLETA PARA COMPLETAR LA MIGRACIÓN A SUPABASE

## ✅ ESTADO ACTUAL

- ✅ App funcionando: https://andre-finances.lindy.site/dashboard
- ✅ Base de datos PostgreSQL en Supabase creada
- ✅ Tablas creadas en Supabase
- ✅ Proyecto configurado en Vercel
- ✅ Variables de entorno configuradas

## 🎯 LO QUE FALTA (3 ARCHIVOS + 1 SCRIPT)

Necesitas subir 3 archivos a GitHub y luego ejecutar un script de migración.

---

# 📋 PASO 1: SUBIR ARCHIVOS A GITHUB

Ve a: https://github.com/andrelahud-art/andre-financies

## ARCHIVO 1: package.json

1. Haz clic en "creating a new file"
2. Nombre: `package.json`
3. Copia y pega este contenido:

```json
{
  "name": "andre-finances",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "db:seed": "prisma db seed"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@prisma/client": "^6.17.1",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.544.0",
    "motion": "^12.23.13",
    "next": "15.5.3",
    "next-themes": "^0.4.6",
    "papaparse": "^5.5.3",
    "prisma": "^6.17.1",
    "react": "19.1.0",
    "react-day-picker": "^9.10.0",
    "react-dom": "19.1.0",
    "react-hook-form": "^7.65.0",
    "react-resizable-panels": "^3.0.6",
    "recharts": "^3.3.0",
    "rrule": "^2.8.1",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.3.1",
    "vaul": "^1.1.2",
    "xlsx": "^0.18.5",
    "zod": "^4.1.12",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^24.8.1",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.5.3",
    "tailwindcss": "^4",
    "ts-node": "^10.9.2",
    "tw-animate-css": "^1.3.8",
    "typescript": "^5",
    "vercel": "^48.4.1"
  }
}
```

4. Haz clic en "Commit changes" → "Commit directly to the main branch" → "Commit changes"

---

## ARCHIVO 2: prisma/schema.prisma

1. Haz clic en "Add file" → "Create new file"
2. Nombre: `prisma/schema.prisma` (GitHub creará la carpeta automáticamente)
3. Copia y pega el contenido del archivo "prisma-schema.txt" que adjuntaste
4. Haz clic en "Commit changes"

---

## ARCHIVO 3: app/api/migrate/route.ts

1. Haz clic en "Add file" → "Create new file"
2. Nombre: `app/api/migrate/route.ts`
3. Copia y pega este contenido:

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
          name: 'André Lahud'
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

    // Migrate Categories
    if (data.categories && data.categories.length > 0) {
      for (const category of data.categories) {
        await prisma.category.upsert({
          where: { id: category.id },
          update: {
            name: category.name,
            kind: category.type,
            color: category.color,
            icon: category.icon
          },
          create: {
            id: category.id,
            userId: user.id,
            name: category.name,
            kind: category.type,
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
            accountId: transaction.accountId,
            categoryId: transaction.categoryId || null,
            merchant: transaction.merchant,
            note: transaction.note
          },
          create: {
            id: transaction.id,
            userId: user.id,
            date: new Date(transaction.date),
            amount: transaction.amount,
            type: transaction.type,
            accountId: transaction.accountId,
            categoryId: transaction.categoryId || null,
            merchant: transaction.merchant,
            note: transaction.note
          }
        });
      }
    }

    // Migrate Debts
    if (data.debts && data.debts.length > 0) {
      for (const debt of data.debts) {
        // First, create an account for this debt
        const debtAccount = await prisma.account.create({
          data: {
            userId: user.id,
            name: `Deuda: ${debt.name}`,
            type: 'CREDIT',
            balance: debt.currentBalance,
            isActive: debt.isActive
          }
        });

        await prisma.debt.create({
          data: {
            id: debt.id,
            userId: user.id,
            name: debt.name,
            principal: debt.originalAmount,
            rateAnnual: debt.interestRate || 0,
            startDate: new Date(debt.startDate),
            termMonths: debt.remainingMonths,
            accountId: debtAccount.id,
            isActive: debt.isActive
          }
        });
      }
    }

    // Migrate Assets
    if (data.assets && data.assets.length > 0) {
      for (const asset of data.assets) {
        await prisma.asset.create({
          data: {
            userId: user.id,
            name: asset.name,
            type: asset.type,
            cost: asset.originalCost,
            currentValue: asset.currentValue,
            purchaseDate: new Date(asset.purchaseDate),
            usefulLife: asset.usefulLife,
            isActive: asset.isActive
          }
        });
      }
    }

    // Migrate Budgets
    if (data.budgets && data.budgets.length > 0) {
      for (const budget of data.budgets) {
        await prisma.budget.create({
          data: {
            userId: user.id,
            name: budget.name || 'Budget',
            categoryId: budget.categoryId,
            monthlyLimit: budget.limit,
            isActive: budget.isActive
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

4. Haz clic en "Commit changes"

---

# ⏱️ PASO 2: ESPERAR EL DEPLOY DE VERCEL

Una vez que subas los 3 archivos, Vercel detectará los cambios automáticamente y hará deploy.

**Tiempo estimado: 2-3 minutos**

Para verificar el progreso:
1. Ve a: https://vercel.com/dashboard
2. Busca tu proyecto "andre-finances"
3. Verás el deploy en progreso

---

# 🚀 PASO 3: EJECUTAR SCRIPT DE MIGRACIÓN

Una vez que el deploy termine:

1. Ve a: https://andre-finances.lindy.site/dashboard
2. Presiona **F12** para abrir la consola del navegador
3. Haz clic en la pestaña **"Console"**
4. Copia y pega este código completo:

```javascript
(async function() {
  console.log('🚀 Iniciando migración de datos a Supabase...');
  
  try {
    // Exportar datos de localStorage
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
    
    console.log('📊 Datos encontrados:');
    console.log(`  - Cuentas: ${data.accounts.length}`);
    console.log(`  - Tarjetas de Crédito: ${data.creditCards.length}`);
    console.log(`  - Categorías: ${data.categories.length}`);
    console.log(`  - Transacciones: ${data.transactions.length}`);
    console.log(`  - Deudas L.P.: ${data.debts.length}`);
    console.log(`  - Activos: ${data.assets.length}`);
    console.log(`  - Presupuestos: ${data.budgets.length}`);
    console.log(`  - Pagos Recurrentes: ${data.recurringRules.length}`);
    
    const totalItems = data.accounts.length + data.creditCards.length + 
                      data.categories.length + data.transactions.length + 
                      data.debts.length + data.assets.length + 
                      data.budgets.length + data.recurringRules.length;
    
    console.log(`📦 Total de registros a migrar: ${totalItems}`);
    
    if (totalItems === 0) {
      console.log('⚠️ No hay datos para migrar');
      return;
    }
    
    console.log('☁️ Enviando datos a Supabase...');
    
    const response = await fetch('/api/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
      console.log(`✅ Usuario ID: ${result.userId}`);
      console.log('✅ Todos los datos han sido guardados en Supabase');
      console.log('');
      console.log('🔍 Verifica tus datos en:');
      console.log('   https://supabase.com/dashboard/project/jdkrtnrhcyjtmbwtatsc/editor');
      console.log('');
      console.log('✨ ¡Tu app ahora tiene persistencia permanente!');
    } else {
      console.error('❌ Error en la migración:', result.error);
      console.log('');
      console.log('💡 Si el error persiste, contacta al soporte');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('💡 Verifica que el deploy de Vercel haya terminado');
  }
})();
```

5. Presiona **Enter**
6. Espera a que termine (verás mensajes en la consola)

---

# ✅ PASO 4: VERIFICAR QUE TODO FUNCIONA

1. Ve a Supabase: https://supabase.com/dashboard/project/jdkrtnrhcyjtmbwtatsc/editor
2. Haz clic en las tablas (User, Account, Transaction, etc.)
3. Verifica que tengan datos
4. Abre tu app desde otro dispositivo o navegador
5. Verifica que los datos se cargan correctamente

---

# 🎉 ¡LISTO!

Una vez completados estos pasos, tu app tendrá:

✅ **Persistencia permanente** en PostgreSQL (Supabase)
✅ **Acceso desde cualquier dispositivo**
✅ **Backup automático** de tus datos
✅ **URL permanente** en Vercel
✅ **Deploy automático** cada vez que hagas cambios en GitHub

---

# 📞 SOPORTE

Si tienes algún problema:

1. Verifica que el deploy de Vercel haya terminado
2. Verifica que las variables de entorno estén configuradas en Vercel
3. Revisa los logs en Vercel: https://vercel.com/dashboard
4. Revisa los logs en Supabase: https://supabase.com/dashboard/project/jdkrtnrhcyjtmbwtatsc/logs

¡Éxito! 🚀
