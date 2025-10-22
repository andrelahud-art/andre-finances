'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, AlertCircle, DollarSign, CreditCard, Package, FileText, Settings, Plus, Upload, X, ChevronDown, ChevronRight, Download, Search, Filter, Edit2, Trash2, Save, AlertTriangle, CheckCircle } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-MX');
};

const buildFrenchSchedule = (principal: number, annualRate: number, termMonths: number, startDate: Date) => {
  const r = annualRate / 12;
  const payment = principal * (r / (1 - Math.pow(1 + r, -termMonths)));
  const rows = [];
  let balance = principal;
  
  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * r;
    const principalDue = payment - interest;
    balance = Math.max(0, balance - principalDue);
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    rows.push({
      n: i,
      dueDate: dueDate.toISOString().split('T')[0],
      principalDue: Math.round(principalDue * 100) / 100,
      interestDue: Math.round(interest * 100) / 100,
      totalDue: Math.round(payment * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      status: dueDate < new Date() ? 'PAID' : 'DUE'
    });
  }
  
  return { payment: Math.round(payment * 100) / 100, rows };
};

const initialAccounts = [
  { id: '1', name: 'Efectivo', type: 'CASH', balance: 15000, currency: 'MXN' },
  { id: '2', name: 'BBVA Cuenta', type: 'BANK', balance: 85000, currency: 'MXN' },
  { id: '3', name: 'TDC BBVA', type: 'CREDIT', balance: -35000, currency: 'MXN' },
  { id: '4', name: 'Mercado Pago', type: 'WALLET', balance: 12000, currency: 'MXN' }
];

const initialCategories = [
  { id: 'c1', name: 'Ingresos', kind: 'INCOME', parentId: null },
  { id: 'c2', name: 'Servicios', kind: 'INCOME', parentId: 'c1' },
  { id: 'c3', name: 'Productos', kind: 'INCOME', parentId: 'c1' },
  { id: 'c4', name: 'Gastos Fijos', kind: 'OPEX', parentId: null },
  { id: 'c5', name: 'Renta', kind: 'OPEX', parentId: 'c4' },
  { id: 'c6', name: 'Luz/Agua', kind: 'OPEX', parentId: 'c4' },
  { id: 'c7', name: 'Internet', kind: 'OPEX', parentId: 'c4' },
  { id: 'c8', name: 'Gastos Variables', kind: 'OPEX', parentId: null },
  { id: 'c9', name: 'Combustible', kind: 'OPEX', parentId: 'c8' },
  { id: 'c10', name: 'Comida', kind: 'OPEX', parentId: 'c8' },
  { id: 'c11', name: 'Compras', kind: 'OPEX', parentId: 'c8' },
  { id: 'c12', name: 'Intereses', kind: 'INTEREST', parentId: null },
  { id: 'c13', name: 'Impuestos', kind: 'TAX', parentId: null }
];

const initialDebts = [
  { id: 'd1', name: 'Camioneta Mazda', principal: 250000, rateAnnual: 0.12, startDate: '2024-01-01', termMonths: 48, accountId: '3' },
  { id: 'd2', name: 'TDC BBVA', principal: 35000, rateAnnual: 0.36, startDate: '2024-06-01', termMonths: 12, accountId: '3' },
  { id: 'd3', name: 'Préstamo Equipo', principal: 80000, rateAnnual: 0.18, startDate: '2024-03-01', termMonths: 24, accountId: '2' }
];

const initialAssets = [
  { id: 'a1', name: 'Mazda CX-5 2020', type: 'VEHICLE', cost: 450000, currentValue: 380000, usefulLife: 120, purchaseDate: '2020-01-15' },
  { id: 'a2', name: 'Karcher K5 Premium', type: 'EQUIPMENT', cost: 12000, currentValue: 9000, usefulLife: 60, purchaseDate: '2023-06-01' },
  { id: 'a3', name: 'Inventario General', type: 'INVENTORY', cost: 45000, currentValue: 45000, usefulLife: 12, purchaseDate: '2024-09-01' }
];

const initialBudgets = [
  { id: 'b1', categoryId: 'c9', monthlyLimit: 3000, name: 'Combustible Mensual' },
  { id: 'b2', categoryId: 'c10', monthlyLimit: 8000, name: 'Comida Mensual' },
  { id: 'b3', categoryId: 'c8', monthlyLimit: 15000, name: 'Variables Total' }
];

const generateTransactions = () => {
  const transactions = [];
  const startDate = new Date('2024-07-01');
  const merchants = {
    'c9': ['PEMEX', 'SHELL', 'OXXO GAS'],
    'c10': ['WALMART', 'SORIANA', 'RESTAURANTE'],
    'c2': ['CLIENTE A', 'CLIENTE B', 'CLIENTE C'],
    'c5': ['ARRENDADOR'],
    'c6': ['CFE', 'SIAPA']
  };
  
  for (let i = 0; i < 200; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * 105));
    
    const isIncome = Math.random() > 0.75;
    const categoryId = isIncome 
      ? (Math.random() > 0.5 ? 'c2' : 'c3')
      : ['c5', 'c6', 'c9', 'c10', 'c11'][Math.floor(Math.random() * 5)];
    
    const merchantList = merchants[categoryId as keyof typeof merchants] || ['VARIOS'];
    const merchant = merchantList[Math.floor(Math.random() * merchantList.length)];
    
    transactions.push({
      id: `t${i + 1}`,
      date: date.toISOString().split('T')[0],
      amount: isIncome 
        ? Math.floor(Math.random() * 20000) + 5000 
        : -(Math.floor(Math.random() * 3500) + 200),
      type: isIncome ? 'INCOME' : 'EXPENSE',
      accountId: ['1', '2', '4'][Math.floor(Math.random() * 3)],
      categoryId,
      note: `${merchant} - ${isIncome ? 'Pago recibido' : 'Compra'}`,
      tags: [],
      source: 'manual',
      merchant
    });
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function AndreFinanceApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [accounts, setAccounts] = useState(initialAccounts);
  const [categories, setCategories] = useState(initialCategories);
  const [transactions, setTransactions] = useState(generateTransactions());
  const [debts, setDebts] = useState(initialDebts);
  const [assets, setAssets] = useState(initialAssets);
  const [budgets, setBudgets] = useState(initialBudgets);
  
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

  const totalCash = useMemo(() => {
    return accounts.filter(a => a.type !== 'CREDIT').reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  const totalDebt = useMemo(() => {
    return debts.reduce((sum, d) => {
      const schedule = buildFrenchSchedule(d.principal, d.rateAnnual, d.termMonths, new Date(d.startDate));
      const remaining = schedule.rows.filter(r => r.status === 'DUE').length > 0 
        ? schedule.rows.find(r => r.status === 'DUE')?.balance || 0
        : 0;
      return sum + remaining;
    }, 0);
  }, [debts]);

  const monthlyPL = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const income = monthTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Math.abs(t.amount), 0);
    const expenses = monthTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Math.abs(t.amount), 0);
    return income - expenses;
  }, [transactions]);

  const upcomingPayments = useMemo(() => {
    const payments = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    debts.forEach(debt => {
      const schedule = buildFrenchSchedule(debt.principal, debt.rateAnnual, debt.termMonths, new Date(debt.startDate));
      const upcoming = schedule.rows.filter(r => {
        const dueDate = new Date(r.dueDate);
        return r.status === 'DUE' && dueDate <= thirtyDaysFromNow;
      });
      
      upcoming.forEach(p => {
        payments.push({ ...p, debtName: debt.name, debtId: debt.id });
      });
    });

    return payments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [debts]);

  const budgetAlerts = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const alerts = [];
    
    budgets.forEach(budget => {
      const spent = transactions
        .filter(t => t.date.startsWith(currentMonth) && t.categoryId === budget.categoryId && t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const percentage = (spent / budget.monthlyLimit) * 100;
      
      if (percentage >= 100) {
        alerts.push({
          type: 'danger',
          message: `¡Presupuesto excedido! ${budget.name}: ${formatCurrency(spent)} / ${formatCurrency(budget.monthlyLimit)}`,
          category: budget.name
        });
      } else if (percentage >= 80) {
        alerts.push({
          type: 'warning',
          message: `Cerca del límite: ${budget.name}: ${formatCurrency(spent)} / ${formatCurrency(budget.monthlyLimit)} (${percentage.toFixed(0)}%)`,
          category: budget.name
        });
      }
    });
    
    return alerts;
  }, [budgets, transactions]);

  const plByMonth = useMemo(() => {
    const months: any = {};
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!months[month]) months[month] = { income: 0, expenses: 0 };
      
      if (t.type === 'INCOME') {
        months[month].income += Math.abs(t.amount);
      } else if (t.type === 'EXPENSE') {
        months[month].expenses += Math.abs(t.amount);
      }
    });

    return Object.keys(months).sort().slice(-6).map(m => ({
      month: m,
      income: Math.round(months[m].income),
      expenses: Math.round(months[m].expenses),
      net: Math.round(months[m].income - months[m].expenses)
    }));
  }, [transactions]);

  const expensesByCategory = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const byCategory: any = {};
    transactions
      .filter(t => t.type === 'EXPENSE' && t.date.startsWith(currentMonth))
      .forEach(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const catName = cat ? cat.name : 'Sin categoría';
        byCategory[catName] = (byCategory[catName] || 0) + Math.abs(t.amount);
      });

    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value: Math.round(value as number) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions, categories]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.merchant?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (dateFilter.from) {
      filtered = filtered.filter(t => t.date >= dateFilter.from);
    }
    
    if (dateFilter.to) {
      filtered = filtered.filter(t => t.date <= dateFilter.to);
    }
    
    return filtered;
  }, [transactions, searchTerm, dateFilter]);

  const addTransaction = useCallback((txData: any) => {
    const newTx = {
      id: `t${Date.now()}`,
      ...txData,
      tags: txData.tags || [],
      source: 'manual'
    };
    setTransactions(prev => [newTx, ...prev]);
    
    const account = accounts.find(a => a.id === txData.accountId);
    if (account) {
      setAccounts(prev => prev.map(a => 
        a.id === txData.accountId 
          ? { ...a, balance: a.balance + txData.amount }
          : a
      ));
    }
  }, [accounts]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const deleteAccount = useCallback((id: string) => {
    if (confirm('¿Eliminar esta cuenta? Esta acción no se puede deshacer.')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  }, []);

  const deleteDebt = useCallback((id: string) => {
    if (confirm('¿Eliminar esta deuda? Esta acción no se puede deshacer.')) {
      setDebts(prev => prev.filter(d => d.id !== id));
    }
  }, []);

  const deleteAsset = useCallback((id: string) => {
    if (confirm('¿Eliminar este activo? Esta acción no se puede deshacer.')) {
      setAssets(prev => prev.filter(a => a.id !== id));
    }
  }, []);

  const addDebt = useCallback((debtData: any) => {
    const newDebt = {
      id: `d${Date.now()}`,
      ...debtData
    };
    setDebts(prev => [...prev, newDebt]);
  }, []);

  const addAsset = useCallback((assetData: any) => {
    const newAsset = {
      id: `a${Date.now()}`,
      ...assetData
    };
    setAssets(prev => [...prev, newAsset]);
  }, []);

  const addAccount = useCallback((accountData: any) => {
    const newAccount = {
      id: `acc${Date.now()}`,
      ...accountData,
      currency: 'MXN'
    };
    setAccounts(prev => [...prev, newAccount]);
  }, []);

  const exportToCSV = useCallback(() => {
    const csv = [
      ['Fecha', 'Monto', 'Tipo', 'Cuenta', 'Categoría', 'Nota', 'Comercio'].join(','),
      ...transactions.map(t => [
        t.date,
        t.amount,
        t.type,
        accounts.find(a => a.id === t.accountId)?.name || '',
        categories.find(c => c.id === t.categoryId)?.name || '',
        t.note || '',
        t.merchant || ''
      ].map(v => `"${v}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `andre-finance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }, [transactions, accounts, categories]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  const TransactionForm = () => {
    const [formData, setFormData] = useState(editingTransaction || {
      date: new Date().toISOString().split('T')[0],
      amount: '',
      type: 'EXPENSE',
      accountId: accounts[0]?.id || '',
      categoryId: categories.find(c => c.parentId)?.id || categories[0]?.id || '',
      note: '',
      merchant: ''
    });

    const handleSubmit = () => {
      if (!formData.amount) return;
      
      const txData = {
        ...formData,
        amount: formData.type === 'EXPENSE' 
          ? -Math.abs(parseFloat(formData.amount)) 
          : Math.abs(parseFloat(formData.amount))
      };
      
      if (editingTransaction) {
        setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...txData } : t));
        setEditingTransaction(null);
      } else {
        addTransaction(txData);
      }
      
      setShowAddTransaction(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingTransaction ? 'Editar' : 'Nueva'} Transacción
            </h3>
            <button onClick={() => {
              setShowAddTransaction(false);
              setEditingTransaction(null);
            }} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="INCOME">Ingreso</option>
                <option value="EXPENSE">Gasto</option>
                <option value="TRANSFER">Transferencia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Monto (MXN)</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cuenta</label>
              <select 
                value={formData.accountId}
                onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select 
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                {categories.filter(c => c.parentId).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comercio/Origen</label>
              <input 
                type="text"
                value={formData.merchant || ''}
                onChange={(e) => setFormData({...formData, merchant: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: PEMEX, WALMART"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nota</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                className="w-full border rounded px-3 py-2"
                rows={2}
                placeholder="Descripción adicional..."
              />
            </div>
            <button 
              onClick={handleSubmit} 
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {editingTransaction ? 'Guardar Cambios' : 'Agregar Transacción'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DebtForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      principal: '',
      rateAnnual: '',
      startDate: new Date().toISOString().split('T')[0],
      termMonths: '',
      accountId: accounts[0]?.id || ''
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.principal || !formData.rateAnnual || !formData.termMonths) return;
      
      addDebt({
        ...formData,
        principal: parseFloat(formData.principal),
        rateAnnual: parseFloat(formData.rateAnnual) / 100,
        termMonths: parseInt(formData.termMonths)
      });
      
      setShowAddDebt(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Nueva Deuda</h3>
            <button onClick={() => setShowAddDebt(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: Crédito automotriz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Monto Principal (MXN)</label>
              <input 
                type="number"
                value={formData.principal}
                onChange={(e) => setFormData({...formData, principal: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tasa Anual (%)</label>
              <input 
                type="number"
                step="0.1"
                value={formData.rateAnnual}
                onChange={(e) => setFormData({...formData, rateAnnual: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="12.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de Inicio</label>
              <input 
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plazo (meses)</label>
              <input 
                type="number"
                value={formData.termMonths}
                onChange={(e) => setFormData({...formData, termMonths: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cuenta Asociada</label>
              <select 
                value={formData.accountId}
                onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Crear Deuda
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AssetForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      type: 'EQUIPMENT',
      cost: '',
      currentValue: '',
      usefulLife: '',
      purchaseDate: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.cost) return;
      
      addAsset({
        ...formData,
        cost: parseFloat(formData.cost),
        currentValue: parseFloat(formData.currentValue || formData.cost),
        usefulLife: parseInt(formData.usefulLife)
      });
      
      setShowAddAsset(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Nuevo Activo</h3>
            <button onClick={() => setShowAddAsset(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: Laptop Dell XPS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="VEHICLE">Vehículo</option>
                <option value="EQUIPMENT">Equipo</option>
                <option value="INVENTORY">Inventario</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Costo Original (MXN)</label>
              <input 
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor Actual (MXN)</label>
              <input 
                type="number"
                value={formData.currentValue}
                onChange={(e) => setFormData({...formData, currentValue: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vida Útil (meses)</label>
              <input 
                type="number"
                value={formData.usefulLife}
                onChange={(e) => setFormData({...formData, usefulLife: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de Compra</label>
              <input 
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <button 
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Crear Activo
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AccountForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      type: 'BANK',
      balance: '0'
    });

    const handleSubmit = () => {
      if (!formData.name) return;
      
      addAccount({
        ...formData,
        balance: parseFloat(formData.balance)
      });
      
      setShowAddAccount(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Nueva Cuenta</h3>
            <button onClick={() => setShowAddAccount(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: Cuenta HSBC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="CASH">Efectivo</option>
                <option value="BANK">Banco</option>
                <option value="CREDIT">Tarjeta de Crédito</option>
                <option value="WALLET">Billetera Digital</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Balance Inicial (MXN)</label>
              <input 
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({...formData, balance: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
              />
            </div>
            <button 
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Crear Cuenta
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button 
          onClick={() => setShowAddTransaction(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={16} /> Nueva Transacción
        </button>
      </div>

      {budgetAlerts.length > 0 && (
        <div className="space-y-2">
          {budgetAlerts.map((alert, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-lg flex items-start gap-3 ${
                alert.type === 'danger' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
              }`}
            >
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Caja Disponible</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCash)}</p>
            </div>
            <DollarSign className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Utilidad del Mes</p>
              <p className={`text-2xl font-bold ${monthlyPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(monthlyPL)}
              </p>
            </div>
            {monthlyPL >= 0 ? <TrendingUp className="text-green-600" size={32} /> : <TrendingDown className="text-red-600" size={32} />}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deuda Total</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalDebt)}</p>
            </div>
            <CreditCard className="text-orange-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Próximos Pagos (30d)</p>
              <p className="text-2xl font-bold text-blue-600">{upcomingPayments.length}</p>
            </div>
            <Calendar className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">P&L Últimos 6 Meses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={plByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Ingresos" />
              <Bar dataKey="expenses" fill="#ef4444" name="Gastos" />
              <Bar dataKey="net" fill="#3b82f6" name="Neto" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Gastos por Categoría (Mes Actual)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Próximos Pagos (30 días)</h3>
        <div className="space-y-2">
          {upcomingPayments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay pagos próximos</p>
          ) : (
            upcomingPayments.slice(0, 5).map((p, i) => {
              const daysUntil = Math.ceil((new Date(p.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100">
                  <div className="flex-1">
                    <p className="font-medium">{p.debtName}</p>
                    <p className="text-sm text-gray-600">{formatDate(p.dueDate)} • {daysUntil} días</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(p.totalDue)}</p>
                    <p className="text-xs text-gray-500">Principal: {formatCurrency(p.principalDue)}</p>
                  </div>
                  <div className={`ml-4 w-3 h-3 rounded-full ${daysUntil <= 7 ? 'bg-red-500' : daysUntil <= 15 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const TransactionsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transacciones</h2>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-300"
          >
            <Download size={16} /> Exportar
          </button>
          <button 
            onClick={() => setShowAddTransaction(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por comercio o nota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded"
            />
          </div>
          <div>
            <input 
              type="date"
              placeholder="Desde"
              value={dateFilter.from}
              onChange={(e) => setDateFilter({...dateFilter, from: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <input 
              type="date"
              placeholder="Hasta"
              value={dateFilter.to}
              onChange={(e) => setDateFilter({...dateFilter, to: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Cuenta</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Categoría</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Comercio</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nota</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Monto</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.slice(0, 100).map(t => {
                const account = accounts.find(a => a.id === t.accountId);
                const category = categories.find(c => c.id === t.categoryId);
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{formatDate(t.date)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        t.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{account?.name}</td>
                    <td className="px-4 py-3 text-sm">{category?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.merchant || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{t.note}</td>
                    <td className={`px-4 py-3 text-sm text-right font-semibold ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(t.amount))}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingTransaction(t);
                            setShowAddTransaction(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('¿Eliminar esta transacción?')) {
                              deleteTransaction(t.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600">
          Mostrando {Math.min(filteredTransactions.length, 100)} de {filteredTransactions.length} transacciones
        </div>
      </div>
    </div>
  );

  const DebtsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Deudas</h2>
        <button 
          onClick={() => setShowAddDebt(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={16} /> Nueva Deuda
        </button>
      </div>

      <div className="grid gap-4">
        {debts.map(debt => {
          const schedule = buildFrenchSchedule(debt.principal, debt.rateAnnual, debt.termMonths, new Date(debt.startDate));
          const paid = schedule.rows.filter(r => r.status === 'PAID').length;
          const nextPayment = schedule.rows.find(r => r.status === 'DUE');
          const remaining = nextPayment?.balance || 0;
          
          return (
            <div key={debt.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{debt.name}</h3>
                  <p className="text-sm text-gray-600">Tasa: {(debt.rateAnnual * 100).toFixed(1)}% anual • Cuota: {formatCurrency(schedule.payment)}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedDebt(selectedDebt === debt.id ? null : debt.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {selectedDebt === debt.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                  <button 
                    onClick={() => deleteDebt(debt.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Principal Original</p>
                  <p className="font-semibold">{formatCurrency(debt.principal)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Saldo Restante</p>
                  <p className="font-semibold text-orange-600">{formatCurrency(remaining)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pagos Realizados</p>
                  <p className="font-semibold">{paid} / {debt.termMonths}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Próximo Pago</p>
                  <p className="font-semibold">{nextPayment ? formatDate(nextPayment.dueDate) : 'Liquidado'}</p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(paid / debt.termMonths) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 text-right">{((paid / debt.termMonths) * 100).toFixed(1)}% completado</p>

              {selectedDebt === debt.id && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold mb-2">Tabla de Amortización</h4>
                  <div className="overflow-x-auto max-h-80 overflow-y-auto border rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Fecha</th>
                          <th className="px-3 py-2 text-right">Principal</th>
                          <th className="px-3 py-2 text-right">Interés</th>
                          <th className="px-3 py-2 text-right">Cuota</th>
                          <th className="px-3 py-2 text-right">Saldo</th>
                          <th className="px-3 py-2 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {schedule.rows.map(row => (
                          <tr key={row.n} className={row.status === 'PAID' ? 'bg-green-50' : row.n === nextPayment?.n ? 'bg-blue-50' : ''}>
                            <td className="px-3 py-2">{row.n}</td>
                            <td className="px-3 py-2">{formatDate(row.dueDate)}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(row.principalDue)}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(row.interestDue)}</td>
                            <td className="px-3 py-2 text-right font-semibold">{formatCurrency(row.totalDue)}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(row.balance)}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-2 py-1 rounded text-xs ${
                                row.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {row.status === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const AssetsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activos</h2>
        <button 
          onClick={() => setShowAddAsset(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={16} /> Nuevo Activo
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map(asset => {
          const depreciation = ((asset.cost - asset.currentValue) / asset.cost * 100).toFixed(1);
          const monthsOwned = Math.floor((new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
          
          return (
            <div key={asset.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{asset.name}</h3>
                  <p className="text-sm text-gray-600">{asset.type}</p>
                </div>
                <button 
                  onClick={() => deleteAsset(asset.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Costo Original</p>
                  <p className="font-semibold">{formatCurrency(asset.cost)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valor Actual</p>
                  <p className="font-semibold text-blue-600">{formatCurrency(asset.currentValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Depreciación</p>
                  <p className="font-semibold text-orange-600">{depreciation}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Antigüedad</p>
                  <p className="font-semibold">{monthsOwned} meses</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Vida útil: {asset.usefulLife} meses</span>
                  <span>{((monthsOwned / asset.usefulLife) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (monthsOwned / asset.usefulLife) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Resumen de Activos</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Valor en Libros</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(assets.reduce((s, a) => s + a.currentValue, 0))}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Costo Original</p>
            <p className="text-2xl font-bold">
              {formatCurrency(assets.reduce((s, a) => s + a.cost, 0))}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Depreciación Acumulada</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(assets.reduce((s, a) => s + (a.cost - a.currentValue), 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configuración</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Cuentas</h3>
        <div className="space-y-3 mb-4">
          {accounts.map(account => (
            <div key={account.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">{account.name}</p>
                <p className="text-sm text-gray-600">{account.type}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(account.balance)}</p>
                  <p className="text-xs text-gray-500">{account.currency}</p>
                </div>
                <button 
                  onClick={() => deleteAccount(account.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setShowAddAccount(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={16} className="inline mr-2" /> Agregar Cuenta
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Categorías</h3>
        <div className="grid grid-cols-2 gap-4">
          {categories.filter(c => !c.parentId).map(parent => (
            <div key={parent.id} className="border rounded p-3">
              <p className="font-semibold mb-2">{parent.name}</p>
              <ul className="space-y-1 text-sm text-gray-600">
                {categories.filter(c => c.parentId === parent.id).map(child => (
                  <li key={child.id} className="pl-3">• {child.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Presupuestos Mensuales</h3>
        <div className="space-y-3">
          {budgets.map(budget => (
            <div key={budget.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">{budget.name}</p>
                <p className="text-sm text-gray-600">
                  {categories.find(c => c.id === budget.categoryId)?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(budget.monthlyLimit)}</p>
                <p className="text-xs text-gray-500">Límite mensual</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">André Finance</h1>
          <p className="text-sm text-blue-100">Sistema Integral de Finanzas Personales</p>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto mt-6 px-4">
        <aside className="w-64 bg-white rounded-lg shadow mr-6 p-4 h-fit sticky top-6">
          <nav className="space-y-1">
            {[
              { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
              { id: 'transactions', icon: FileText, label: 'Transacciones' },
              { id: 'debts', icon: CreditCard, label: 'Deudas' },
              { id: 'assets', icon: Package, label: 'Activos' },
              { id: 'settings', icon: Settings, label: 'Configuración' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 pb-8">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'transactions' && <TransactionsView />}
          {currentView === 'debts' && <DebtsView />}
          {currentView === 'assets' && <AssetsView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {showAddTransaction && <TransactionForm />}
      {showAddDebt && <DebtForm />}
      {showAddAsset && <AssetForm />}
      {showAddAccount && <AccountForm />}
    </div>
  );
}
