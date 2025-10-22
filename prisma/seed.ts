import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function buildFrenchSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  start: Date
) {
  const r = annualRate / 12 / 100;
  const payment = principal * (r / (1 - Math.pow(1 + r, -termMonths)));
  const rows = [];
  let balance = principal;

  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * r;
    const principalDue = payment - interest;
    balance = Math.max(0, balance - principalDue);
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + i);
    rows.push({
      n: i,
      dueDate,
      principalDue: Math.round(principalDue * 100) / 100,
      interestDue: Math.round(interest * 100) / 100,
      totalDue: Math.round(payment * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  return { payment: Math.round(payment * 100) / 100, rows };
}

async function main() {
  // First, delete existing data
  await prisma.debtSchedule.deleteMany({});
  await prisma.debt.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.user.deleteMany({});

  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'André',
    },
  });

  const userId = user.id;
  console.log('✓ User created:', userId);

  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        name: 'Efectivo',
        type: 'CASH',
        currency: 'MXN',
        balance: 50000,
        userId,
      },
    }),
    prisma.account.create({
      data: {
        name: 'BBVA',
        type: 'BANK',
        currency: 'MXN',
        balance: 150000,
        userId,
      },
    }),
    prisma.account.create({
      data: {
        name: 'Tarjeta de Crédito',
        type: 'CREDIT',
        currency: 'MXN',
        balance: -25000,
        userId,
      },
    }),
    prisma.account.create({
      data: {
        name: 'Mercado Libre Wallet',
        type: 'WALLET',
        currency: 'MXN',
        balance: 30000,
        userId,
      },
    }),
  ]);

  console.log('✓ Accounts created:', accounts.length);

  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Salario', kind: 'INCOME', userId },
    }),
    prisma.category.create({
      data: { name: 'Freelance', kind: 'INCOME', userId },
    }),
    prisma.category.create({
      data: { name: 'Costo de Bienes', kind: 'COGS', userId },
    }),
    prisma.category.create({
      data: { name: 'Renta', kind: 'OPEX', userId },
    }),
    prisma.category.create({
      data: { name: 'Servicios', kind: 'OPEX', userId },
    }),
    prisma.category.create({
      data: { name: 'Combustible', kind: 'OPEX', userId },
    }),
    prisma.category.create({
      data: { name: 'Comida', kind: 'OPEX', userId },
    }),
    prisma.category.create({
      data: { name: 'Intereses', kind: 'INTEREST', userId },
    }),
    prisma.category.create({
      data: { name: 'Impuestos', kind: 'TAX', userId },
    }),
  ]);

  console.log('✓ Categories created:', categories.length);

  const now = new Date();
  const transactions = [
    {
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      amount: 50000,
      type: 'INCOME',
      accountId: accounts[1].id,
      categoryId: categories[0].id,
      note: 'Salario mensual',
    },
    {
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      amount: 15000,
      type: 'EXPENSE',
      accountId: accounts[1].id,
      categoryId: categories[3].id,
      note: 'Renta del mes',
    },
    {
      date: new Date(now.getFullYear(), now.getMonth(), 7),
      amount: 3000,
      type: 'EXPENSE',
      accountId: accounts[0].id,
      categoryId: categories[5].id,
      note: 'Gasolina',
    },
    {
      date: new Date(now.getFullYear(), now.getMonth(), 10),
      amount: 5000,
      type: 'EXPENSE',
      accountId: accounts[2].id,
      categoryId: categories[6].id,
      note: 'Compras en supermercado',
    },
    {
      date: new Date(now.getFullYear(), now.getMonth(), 15),
      amount: 20000,
      type: 'INCOME',
      accountId: accounts[3].id,
      categoryId: categories[1].id,
      note: 'Proyecto freelance',
    },
  ];

  await Promise.all(
    transactions.map((tx) =>
      prisma.transaction.create({
        data: { ...tx, userId },
      })
    )
  );

  console.log('✓ Transactions created:', transactions.length);

  const debtAccount = accounts[2];
  const debts = [
    {
      name: 'Camioneta Ford',
      principal: 300000,
      rateAnnual: 8.5,
      startDate: new Date(2023, 0, 1),
      termMonths: 60,
      accountId: debtAccount.id,
    },
    {
      name: 'Tarjeta de Crédito BBVA',
      principal: 25000,
      rateAnnual: 18,
      startDate: new Date(2025, 8, 1),
      termMonths: 12,
      accountId: debtAccount.id,
    },
    {
      name: 'Préstamo Personal',
      principal: 50000,
      rateAnnual: 12,
      startDate: new Date(2024, 6, 1),
      termMonths: 24,
      accountId: debtAccount.id,
    },
  ];

  for (const debtData of debts) {
    const debt = await prisma.debt.create({
      data: { ...debtData, userId },
    });

    const schedule = buildFrenchSchedule(
      debtData.principal,
      debtData.rateAnnual,
      debtData.termMonths,
      debtData.startDate
    );

    await Promise.all(
      schedule.rows.map((row) =>
        prisma.debtSchedule.create({
          data: {
            debtId: debt.id,
            dueDate: row.dueDate,
            principalDue: row.principalDue,
            interestDue: row.interestDue,
            totalDue: row.totalDue,
            status: 'DUE',
          },
        })
      )
    );
  }

  console.log('✓ Debts created:', debts.length);

  const assets = [
    {
      name: 'Mazda CX-5',
      type: 'VEHICLE',
      cost: 400000,
      currentValue: 350000,
      method: 'straight_line',
      usefulLifeMonths: 120,
      purchaseDate: new Date(2021, 0, 1),
    },
    {
      name: 'Kärcher Pressure Washer',
      type: 'EQUIPMENT',
      cost: 8000,
      currentValue: 5000,
      method: 'straight_line',
      usefulLifeMonths: 60,
      purchaseDate: new Date(2022, 6, 1),
    },
  ];

  await Promise.all(
    assets.map((asset) =>
      prisma.asset.create({
        data: { ...asset, userId },
      })
    )
  );

  console.log('✓ Assets created:', assets.length);

  const inventoryItems = [
    {
      sku: 'INV-001',
      name: 'Producto A',
      quantity: 100,
      costAverage: 500,
      valuationMethod: 'AVG',
      accountId: accounts[1].id,
    },
    {
      sku: 'INV-002',
      name: 'Producto B',
      quantity: 50,
      costAverage: 1000,
      valuationMethod: 'FIFO',
      accountId: accounts[1].id,
    },
  ];

  await Promise.all(
    inventoryItems.map((item) =>
      prisma.inventoryItem.create({
        data: { ...item, userId },
      })
    )
  );

  console.log('✓ Inventory items created:', inventoryItems.length);

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
