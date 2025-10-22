// Types for Andre Finances Application

export interface User {
  id: string;
  email: string;
  name?: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId?: string;
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  date: Date;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
  account?: Account;
  category?: Category;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  type: 'INCOME' | 'EXPENSE';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  userId: string;
  name: string;
  type: string;
  originalCost: number;
  currentValue: number;
  purchaseDate: Date;
  usefulLife?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Legacy fields for compatibility
  cost?: number;
  usefulLifeMonths?: number;
}

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  sku?: string;
  quantity: number;
  costAverage: number;
  valuationMethod: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Debt {
  id: string;
  userId: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  monthlyPayment: number;
  dueDate: Date;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields for compatibility
  principal?: number;
  rateAnnual?: number;
  termMonths?: number;
  schedules?: Payment[];
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  monthlyLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface Payment {
  id: string;
  debtId: string;
  amount: number;
  dueDate: Date;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  debt?: Debt;
  // Additional fields for calculations
  principalDue?: number;
  interestDue?: number;
  totalDue?: number;
  balance?: number;
}

export interface PnLData {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  incomeByCategory: Array<{
    category: string;
    amount: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
  }>;
}

export interface CashFlowData {
  date: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface FormData {
  [key: string]: string | number | Date | boolean;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}