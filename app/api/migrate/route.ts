import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Create or get user
    let user = await prisma.user.findUnique({
      where: { email: 'andre@finances.com' }
    });

    if (!user) {
      user = await prisma.user.create({
        data:
          email: 'andre@finances.com',
          name: 'André Lahud',

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

    // Migrate Assets
    if (data.assets && data.assets.length > 0) {
      for (const asset of data.assets) {
        await prisma.asset.upsert({
          where: { id: asset.id },
          update: {
            name: asset.name,
            type: asset.type,
            originalCost: asset.originalCost,
            currentValue: asset.currentValue,
            purchaseDate: new Date(asset.purchaseDate),
            usefulLife: asset.usefulLife,
            isActive: asset.isActive
          },
          create: {
            id: asset.id,
            userId: user.id,
            name: asset.name,
            type: asset.type,
            originalCost: asset.originalCost,
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
        await prisma.budget.upsert({
          where: { id: budget.id },
          update: {
            categoryId: budget.categoryId,
            monthlyLimit: budget.limit,
            isActive: budget.isActive
          },
          create: {
            id: budget.id,
            userId: user.id,
            categoryId: budget.categoryId,
            monthlyLimit: budget.limit,
            isActive: budget.isActive
          }
        });
      }
    }

    // Migrate Recurring Rules (Calendar Payments)
    if (data.recurringRules && data.recurringRules.length > 0) {
      for (const rule of data.recurringRules) {
        await prisma.recurringRule.upsert({
          where: { id: rule.id },
          update: {
            name: rule.name,
            amount: rule.amount,
            type: rule.type,
            frequency: rule.frequency,
            recurrenceType: rule.recurrenceType,
            startDate: new Date(rule.startDate),
            endDate: rule.endDate ? new Date(rule.endDate) : null,
            isActive: rule.isActive
          },
          create: {
            id: rule.id,
            userId: user.id,
            name: rule.name,
            amount: rule.amount,
            type: rule.type,
            frequency: rule.frequency,
            recurrenceType: rule.recurrenceType,
            startDate: new Date(rule.startDate),
            endDate: rule.endDate ? new Date(rule.endDate) : null,
            isActive: rule.isActive
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
