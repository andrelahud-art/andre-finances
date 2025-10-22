import { User, Account, Transaction, Category } from '@/types';

// Mock data para desarrollo cuando no hay base de datos
export const mockUser: User = {
  id: 'user_andre',
  email: 'andre@finance.local',
  name: 'André',
  password: 'mock_password',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAccounts: Account[] = [
  {
    id: 'acc_1',
    userId: mockUser.id,
    name: 'Cuenta Principal',
    type: 'CHECKING',
    currency: 'MXN',
    balance: 25000.00,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc_2',
    userId: mockUser.id,
    name: 'Ahorros',
    type: 'SAVINGS',
    currency: 'MXN',
    balance: 50000.00,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCategories: Category[] = [
  {
    id: 'cat_1',
    userId: mockUser.id,
    name: 'Alimentación',
    type: 'EXPENSE',
    color: '#ef4444',
    icon: '🍽️',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat_2',
    userId: mockUser.id,
    name: 'Salario',
    type: 'INCOME',
    color: '#22c55e',
    icon: '💰',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx_1',
    userId: mockUser.id,
    accountId: 'acc_1',
    categoryId: 'cat_2',
    amount: 15000.00,
    type: 'INCOME',
    date: new Date(),
    description: 'Salario quincenal',
    isRecurring: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tx_2',
    userId: mockUser.id,
    accountId: 'acc_1',
    categoryId: 'cat_1',
    amount: -250.00,
    type: 'EXPENSE',
    date: new Date(),
    description: 'Supermercado',
    isRecurring: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];