-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Account table
CREATE TABLE IF NOT EXISTS "Account" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT DEFAULT 'MXN',
  balance DECIMAL(15,2) DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create CreditCard table
CREATE TABLE IF NOT EXISTS "CreditCard" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "creditLimit" DECIMAL(15,2) NOT NULL,
  "currentBalance" DECIMAL(15,2) DEFAULT 0,
  "cutoffDay" INTEGER NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Category table
CREATE TABLE IF NOT EXISTS "Category" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Transaction table
CREATE TABLE IF NOT EXISTS "Transaction" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL,
  "accountId" TEXT REFERENCES "Account"(id) ON DELETE SET NULL,
  "creditCardId" TEXT REFERENCES "CreditCard"(id) ON DELETE SET NULL,
  "categoryId" TEXT REFERENCES "Category"(id) ON DELETE SET NULL,
  merchant TEXT,
  note TEXT,
  "isInvestment" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Debt table
CREATE TABLE IF NOT EXISTS "Debt" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  "currentBalance" DECIMAL(15,2) NOT NULL,
  "originalAmount" DECIMAL(15,2) NOT NULL,
  "interestRate" DECIMAL(6,4),
  "monthlyPayment" DECIMAL(15,2) NOT NULL,
  "remainingMonths" INTEGER NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  description TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Asset table
CREATE TABLE IF NOT EXISTS "Asset" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  "originalCost" DECIMAL(15,2) NOT NULL,
  "currentValue" DECIMAL(15,2) NOT NULL,
  "purchaseDate" TIMESTAMP NOT NULL,
  "usefulLife" INTEGER,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Budget table
CREATE TABLE IF NOT EXISTS "Budget" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "categoryId" TEXT NOT NULL REFERENCES "Category"(id) ON DELETE CASCADE,
  "monthlyLimit" DECIMAL(15,2) NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create RecurringRule table
CREATE TABLE IF NOT EXISTS "RecurringRule" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  "recurrenceType" TEXT NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Goal table
CREATE TABLE IF NOT EXISTS "Goal" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "targetAmount" DECIMAL(15,2) NOT NULL,
  "targetDate" TIMESTAMP NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "achievedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "CreditCard_userId_idx" ON "CreditCard"("userId");
CREATE INDEX IF NOT EXISTS "Category_userId_idx" ON "Category"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_accountId_idx" ON "Transaction"("accountId");
CREATE INDEX IF NOT EXISTS "Transaction_creditCardId_idx" ON "Transaction"("creditCardId");
CREATE INDEX IF NOT EXISTS "Transaction_categoryId_idx" ON "Transaction"("categoryId");
CREATE INDEX IF NOT EXISTS "Transaction_date_idx" ON "Transaction"(date);
CREATE INDEX IF NOT EXISTS "Transaction_type_idx" ON "Transaction"(type);
CREATE INDEX IF NOT EXISTS "Debt_userId_idx" ON "Debt"("userId");
CREATE INDEX IF NOT EXISTS "Asset_userId_idx" ON "Asset"("userId");
CREATE INDEX IF NOT EXISTS "Asset_type_idx" ON "Asset"(type);
CREATE INDEX IF NOT EXISTS "Budget_userId_idx" ON "Budget"("userId");
CREATE INDEX IF NOT EXISTS "Budget_categoryId_idx" ON "Budget"("categoryId");
CREATE INDEX IF NOT EXISTS "RecurringRule_userId_idx" ON "RecurringRule"("userId");
CREATE INDEX IF NOT EXISTS "Goal_userId_idx" ON "Goal"("userId");
