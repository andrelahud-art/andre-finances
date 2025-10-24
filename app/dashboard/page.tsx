'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, TrendingUp, TrendingDown, AlertCircle, DollarSign, CreditCard, Package, FileText, Settings, Plus, X, ChevronDown, ChevronRight, Download, Search, Filter, Edit2, Trash2, Save, AlertTriangle, CheckCircle, LogOut, Wallet, BarChart3, TrendingUpIcon, Zap, Percent, PieChart, Activity } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-MX');
};

export default function DashboardPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State for all data
  const [accounts, setAccounts] = useState<any[]>([]);
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [longTermDebts, setLongTermDebts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([
    { id: 'cat1', name: 'Comida' },
    { id: 'cat2', name: 'Transporte' },
    { id: 'cat3', name: 'Servicios' },
    { id: 'cat4', name: 'Compras' },
    { id: 'cat5', name: 'Otros' }
  ]);

  // Modal states
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddCreditCard, setShowAddCreditCard] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showPayCreditCard, setShowPayCreditCard] = useState(false);
  const [showAddLongTermDebt, setShowAddLongTermDebt] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [editingDebt, setEditingDebt] = useState<any>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

  // Load data directly without authentication
  useEffect(() => {
    // Set default user for the session
    setUser({ id: 'default-user', name: 'Usuario', email: 'usuario@app.com' });
    loadData();
    setLoading(false);
  }, []);

  const loadData = async () => {
    try {
      const savedAccounts = localStorage.getItem('accounts') ? JSON.parse(localStorage.getItem('accounts')!) : [];
      const savedCreditCards = localStorage.getItem('creditCards') ? JSON.parse(localStorage.getItem('creditCards')!) : [];
      const savedTransactions = localStorage.getItem('transactions') ? JSON.parse(localStorage.getItem('transactions')!) : [];
      const savedBudgets = localStorage.getItem('budgets') ? JSON.parse(localStorage.getItem('budgets')!) : [];
      const savedAssets = localStorage.getItem('assets') ? JSON.parse(localStorage.getItem('assets')!) : [];
      const savedPayments = localStorage.getItem('payments') ? JSON.parse(localStorage.getItem('payments')!) : [];
      const savedLongTermDebts = localStorage.getItem('longTermDebts') ? JSON.parse(localStorage.getItem('longTermDebts')!) : [];

      setAccounts(savedAccounts);
      setCreditCards(savedCreditCards);
      setTransactions(savedTransactions);
      setBudgets(savedBudgets);
      setAssets(savedAssets);
      setPayments(savedPayments);
      setLongTermDebts(savedLongTermDebts);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = useCallback((key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, []);

  const handleLogout = () => {
    // No logout needed - refresh the page instead
    window.location.reload();
  };

  // ==================== ACCOUNTS ====================
  const addAccount = useCallback((accountData: any) => {
    const newAccount = {
      id: `acc${Date.now()}`,
      ...accountData,
      createdAt: new Date().toISOString()
    };
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    saveData('accounts', updated);
  }, [accounts, saveData]);

  const deleteAccount = useCallback((id: string) => {
    if (confirm('¿Eliminar esta cuenta?')) {
      const updated = accounts.filter(a => a.id !== id);
      setAccounts(updated);
      saveData('accounts', updated);
    }
  }, [accounts, saveData]);

  // ==================== CREDIT CARDS ====================
  const addCreditCard = useCallback((cardData: any) => {
    const newCard = {
      id: `cc${Date.now()}`,
      ...cardData,
      createdAt: new Date().toISOString()
    };
    const updated = [...creditCards, newCard];
    setCreditCards(updated);
    saveData('creditCards', updated);
  }, [creditCards, saveData]);

  const deleteCreditCard = useCallback((id: string) => {
    if (confirm('¿Eliminar esta tarjeta de crédito?')) {
      const updated = creditCards.filter(c => c.id !== id);
      setCreditCards(updated);
      saveData('creditCards', updated);
    }
  }, [creditCards, saveData]);

  // ==================== TRANSACTIONS ====================
  const addTransaction = useCallback((txData: any) => {
    const newTx = {
      id: `t${Date.now()}`,
      ...txData,
      createdAt: new Date().toISOString()
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveData('transactions', updated);

    // Si es pago con TDC, NO debitar cuenta, solo aumentar deuda TDC
    if (txData.creditCardId && txData.type === 'EXPENSE') {
      const updatedCards = creditCards.map(c =>
        c.id === txData.creditCardId
          ? { ...c, balance: c.balance + Math.abs(txData.amount) }
          : c
      );
      setCreditCards(updatedCards);
      saveData('creditCards', updatedCards);
    } else if (txData.accountId) {
      // Si es transacción normal, debitar/acreditar cuenta
      const updatedAccounts = accounts.map(a =>
        a.id === txData.accountId
          ? { ...a, balance: a.balance + txData.amount }
          : a
      );
      setAccounts(updatedAccounts);
      saveData('accounts', updatedAccounts);
    }
  }, [transactions, accounts, creditCards, saveData]);

  const deleteTransaction = useCallback((id: string) => {
    if (confirm('¿Eliminar esta transacción?')) {
      const tx = transactions.find(t => t.id === id);
      if (tx) {
        if (tx.creditCardId && tx.type === 'EXPENSE') {
          const updatedCards = creditCards.map(c =>
            c.id === tx.creditCardId
              ? { ...c, balance: c.balance - Math.abs(tx.amount) }
              : c
          );
          setCreditCards(updatedCards);
          saveData('creditCards', updatedCards);
        } else if (tx.accountId) {
          const updatedAccounts = accounts.map(a =>
            a.id === tx.accountId
              ? { ...a, balance: a.balance - tx.amount }
              : a
          );
          setAccounts(updatedAccounts);
          saveData('accounts', updatedAccounts);
        }
      }

      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      saveData('transactions', updated);
    }
  }, [transactions, accounts, creditCards, saveData]);

  // ==================== BUDGETS ====================
  const addBudget = useCallback((budgetData: any) => {
    const newBudget = {
      id: `b${Date.now()}`,
      ...budgetData,
      spent: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [...budgets, newBudget];
    setBudgets(updated);
    saveData('budgets', updated);
  }, [budgets, saveData]);

  const deleteBudget = useCallback((id: string) => {
    if (confirm('¿Eliminar este presupuesto?')) {
      const updated = budgets.filter(b => b.id !== id);
      setBudgets(updated);
      saveData('budgets', updated);
    }
  }, [budgets, saveData]);

  // ==================== ASSETS ====================
  const addAsset = useCallback((assetData: any) => {
    const newAsset = {
      id: `ast${Date.now()}`,
      ...assetData,
      createdAt: new Date().toISOString()
    };
    const updated = [...assets, newAsset];
    setAssets(updated);
    saveData('assets', updated);
  }, [assets, saveData]);

  const deleteAsset = useCallback((id: string) => {
    if (confirm('¿Eliminar este activo?')) {
      const updated = assets.filter(a => a.id !== id);
      setAssets(updated);
      saveData('assets', updated);
    }
  }, [assets, saveData]);

  // ==================== PAYMENTS ====================
  const addPayment = useCallback((paymentData: any) => {
    const newPayment = {
      id: `pay${Date.now()}`,
      ...paymentData,
      createdAt: new Date().toISOString()
    };
    const updated = [...payments, newPayment];
    setPayments(updated);
    saveData('payments', updated);
  }, [payments, saveData]);

  const deletePayment = useCallback((id: string) => {
    if (confirm('¿Eliminar este pago?')) {
      const updated = payments.filter(p => p.id !== id);
      setPayments(updated);
      saveData('payments', updated);
    }
  }, [payments, saveData]);

  // ==================== LONG TERM DEBTS ====================
  const addLongTermDebt = useCallback((debtData: any) => {
    const newDebt = {
      id: `debt${Date.now()}`,
      ...debtData,
      createdAt: new Date().toISOString()
    };
    const updated = [...longTermDebts, newDebt];
    setLongTermDebts(updated);
    saveData('longTermDebts', updated);
  }, [longTermDebts, saveData]);

  const deleteLongTermDebt = useCallback((id: string) => {
    if (confirm('¿Eliminar esta deuda?')) {
      const updated = longTermDebts.filter(d => d.id !== id);
      setLongTermDebts(updated);
      saveData('longTermDebts', updated);
    }
  }, [longTermDebts, saveData]);

  // ==================== CREDIT CARD PAYMENT ====================
  const payCreditCard = useCallback((paymentData: any) => {
    // Restar de la cuenta de débito
    const updatedAccounts = accounts.map(a =>
      a.id === paymentData.fromAccountId
        ? { ...a, balance: a.balance - paymentData.amount }
        : a
    );
    setAccounts(updatedAccounts);
    saveData('accounts', updatedAccounts);

    // Restar de la deuda de la TDC
    const updatedCards = creditCards.map(c =>
      c.id === paymentData.creditCardId
        ? { ...c, balance: Math.max(0, c.balance - paymentData.amount) }
        : c
    );
    setCreditCards(updatedCards);
    saveData('creditCards', updatedCards);

    // Registrar transacción de pago
    const paymentTx = {
      id: `t${Date.now()}`,
      date: paymentData.date,
      amount: -paymentData.amount,
      type: 'PAYMENT',
      accountId: paymentData.fromAccountId,
      creditCardId: paymentData.creditCardId,
      categoryId: 'cat_payment',
      note: `Pago TDC ${creditCards.find(c => c.id === paymentData.creditCardId)?.name}`,
      merchant: 'PAGO TDC',
      isInvestment: false,
      createdAt: new Date().toISOString()
    };

    const updated = [paymentTx, ...transactions];
    setTransactions(updated);
    saveData('transactions', updated);
  }, [accounts, creditCards, transactions, saveData]);

  // ==================== CALCULATIONS ====================
  const totalCash = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  }, [accounts]);

  const totalCreditCardDebt = useMemo(() => {
    return creditCards.reduce((sum, c) => sum + (c.balance || 0), 0);
  }, [creditCards]);

  const totalLongTermDebt = useMemo(() => {
    return longTermDebts.reduce((sum, d) => sum + (d.balance || 0), 0);
  }, [longTermDebts]);

  const totalAssets = useMemo(() => {
    return assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
  }, [assets]);

  const investmentFlow = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return transactions
      .filter(t => t.date.startsWith(currentMonth) && t.isInvestment)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const expenseFlow = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return transactions
      .filter(t => t.date.startsWith(currentMonth) && t.type === 'EXPENSE' && !t.isInvestment)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const totalCreditLimit = useMemo(() => {
    return creditCards.reduce((sum, c) => sum + (c.limit || 0), 0);
  }, [creditCards]);

  const creditUtilizationPercent = useMemo(() => {
    if (totalCreditLimit === 0) return 0;
    return (totalCreditCardDebt / totalCreditLimit) * 100;
  }, [totalCreditCardDebt, totalCreditLimit]);

  const netWorth = useMemo(() => {
    return totalCash + totalAssets - totalCreditCardDebt - totalLongTermDebt;
  }, [totalCash, totalAssets, totalCreditCardDebt, totalLongTermDebt]);

  const budgetStatus = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => 
          t.date.startsWith(currentMonth) && 
          t.categoryId === budget.categoryId && 
          t.type === 'EXPENSE' &&
          !t.isInvestment
        )
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const percentage = (spent / budget.limit) * 100;
      const remaining = Math.max(0, budget.limit - spent);

      return {
        ...budget,
        spent,
        remaining,
        percentage: Math.min(100, percentage),
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
      };
    });
  }, [budgets, transactions]);

  const upcomingPayments = useMemo(() => {
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return payments
      .filter(p => {
        const payDate = new Date(p.nextDate);
        return payDate >= today && payDate <= next30Days;
      })
      .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());
  }, [payments]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  // ==================== FORMS ====================

  const TransactionForm = () => {
    const [formData, setFormData] = useState(editingTransaction || {
      date: new Date().toISOString().split('T')[0],
      amount: '',
      type: 'EXPENSE',
      accountId: accounts[0]?.id || '',
      creditCardId: '',
      categoryId: categories[0]?.id || '',
      note: '',
      merchant: '',
      isInvestment: false
    });

    const handleSubmit = () => {
      if (!formData.amount) return;

      const txData = {
        ...formData,
        amount: formData.type === 'EXPENSE'
          ? -Math.abs(parseFloat(formData.amount))
          : Math.abs(parseFloat(formData.amount)),
        isInvestment: formData.isInvestment === 'true' || formData.isInvestment === true
      };

      if (editingTransaction) {
        const updated = transactions.map(t => t.id === editingTransaction.id ? { ...t, ...txData } : t);
        setTransactions(updated);
        saveData('transactions', updated);
        setEditingTransaction(null);
      } else {
        addTransaction(txData);
      }

      setShowAddTransaction(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {editingTransaction ? 'Editar' : 'Nueva'} Transacción
            </h3>
            <button onClick={() => {
              setShowAddTransaction(false);
              setEditingTransaction(null);
            }} className="text-slate-400 hover:text-slate-200">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="INCOME">Ingreso</option>
                <option value="EXPENSE">Gasto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Monto (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">¿Es Inversión?</label>
              <select
                value={formData.isInvestment}
                onChange={(e) => setFormData({ ...formData, isInvestment: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cuenta</label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Seleccionar cuenta</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tarjeta de Crédito (Opcional)</label>
              <select
                value={formData.creditCardId}
                onChange={(e) => setFormData({ ...formData, creditCardId: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Sin tarjeta</option>
                {creditCards.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Categoría</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Comercio</label>
              <input
                type="text"
                value={formData.merchant || ''}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Ej: PEMEX, WALMART"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nota</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                rows={2}
                placeholder="Descripción adicional..."
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded font-medium flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {editingTransaction ? 'Guardar Cambios' : 'Agregar Transacción'}
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
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Nueva Cuenta</h3>
            <button onClick={() => setShowAddAccount(false)} className="text-slate-400 hover:text-slate-200">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Ej: Cuenta BBVA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="CASH">Efectivo</option>
                <option value="BANK">Banco</option>
                <option value="WALLET">Billetera Digital</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Balance Inicial (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded font-medium"
            >
              Crear Cuenta
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CreditCardForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      bank: '',
      lastDigits: '',
      limit: '',
      balance: '0',
      dueDay: '15'
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.limit) return;

      addCreditCard({
        ...formData,
        limit: parseFloat(formData.limit),
        balance: parseFloat(formData.balance),
        dueDay: parseInt(formData.dueDay)
      });

      setShowAddCreditCard(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Nueva Tarjeta de Crédito</h3>
            <button onClick={() => setShowAddCreditCard(false)} className="text-slate-400 hover:text-slate-200">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Ej: TDC BBVA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Banco</label>
              <input
                type="text"
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Ej: BBVA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Últimos 4 Dígitos</label>
              <input
                type="text"
                value={formData.lastDigits}
                onChange={(e) => setFormData({ ...formData, lastDigits: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="1234"
                maxLength={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Límite de Crédito (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Saldo Actual (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Día de Corte</label>
              <input
                type="number"
                value={formData.dueDay}
                onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                min="1"
                max="31"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded font-medium"
            >
              Crear Tarjeta
            </button>
          </div>
        </div>
      </div>
    );
  };

  const BudgetForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      categoryId: categories[0]?.id || '',
      limit: ''
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.limit) return;

      addBudget({
        ...formData,
        limit: parseFloat(formData.limit)
      });

      setShowAddBudget(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Nuevo Presupuesto</h3>
            <button onClick={() => setShowAddBudget(false)} className="text-slate-400 hover:text-slate-200">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Ej: Presupuesto Comida"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Categoría</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Límite Mensual (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded font-medium"
            >
              Crear Presupuesto
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AssetForm = () => {
    const [formData, setFormData] = useState(editingAsset || {
      name: '',
      type: 'VEHICLE',
      cost: '',
      currentValue: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      usefulLife: ''
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.cost) return;

      const assetData = {
        ...formData,
        cost: parseFloat(formData.cost),
        currentValue: parseFloat(formData.currentValue || formData.cost),
        usefulLife: formData.usefulLife ? parseInt(formData.usefulLife) : null
      };

      if (editingAsset) {
        const updated = assets.map(a => a.id === editingAsset.id ? { ...a, ...assetData } : a);
        setAssets(updated);
        saveData('assets', updated);
        setEditingAsset(null);
      } else {
        addAsset(assetData);
      }

      setShowAddAsset(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {editingAsset ? 'Editar' : 'Nuevo'} Activo
            </h3>
            <button onClick={() => {
              setShowAddAsset(false);
              setEditingAsset(null);
            }} className="text-slate-400 hover:text-slate-200">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Ej: Auto Honda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="VEHICLE">Vehículo</option>
                <option value="EQUIPMENT">Equipo</option>
                <option value="PROPERTY">Propiedad</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Costo Original (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Valor Actual (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fecha de Compra</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Vida Útil (meses, opcional)</label>
              <input
                type="number"
                value={formData.usefulLife}
                onChange={(e) => setFormData({ ...formData, usefulLife: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="60"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded font-medium flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {editingAsset ? 'Guardar Cambios' : 'Crear Activo'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PaymentForm = () => {
    const [formData, setFormData] = useState(editingPayment || {
      name: '',
      amount: '',
      type: 'MONTHLY',
      recurrenceType: 'INDEFINITE',
      recurrenceCount: '',
      nextDate: new Date().toISOString().split('T')[0],
      accountId: accounts[0]?.id || '',
      categoryId: categories[0]?.id || '',
      note: ''
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.amount) return;

      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        recurrenceCount: formData.recurrenceCount ? parseInt(formData.recurrenceCount) : null
      };

      if (editingPayment) {
        const updated = payments.map(p => p.id === editingPayment.id ? { ...p, ...paymentData } : p);
        setPayments(updated);
        saveData('payments', updated);
        setEditingPayment(null);
      } else {
        addPayment(paymentData);
      }

      setShowAddPayment(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {editingPayment ? 'Editar' : 'Nuevo'} Pago Recurrente
            </h3>
            <button onClick={() => {
              setShowAddPayment(false);
              setEditingPayment(null);
            }} className="text-slate-400 hover:text-slate-200">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Ej: Renta Oficina"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Monto (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Frecuencia</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="DAILY">Diario</option>
                <option value="WEEKLY">Semanal</option>
                <option value="MONTHLY">Mensual</option>
                <option value="CUSTOM">Personalizado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Recurrencia</label>
              <select
                value={formData.recurrenceType}
                onChange={(e) => setFormData({ ...formData, recurrenceType: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="INDEFINITE">Indefinida</option>
                <option value="DEFINED">Definida</option>
                <option value="ONCE">Una sola vez</option>
              </select>
            </div>
            {formData.recurrenceType === 'DEFINED' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Número de Pagos</label>
                <input
                  type="number"
                  value={formData.recurrenceCount}
                  onChange={(e) => setFormData({ ...formData, recurrenceCount: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="12"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Próximo Pago</label>
              <input
                type="date"
                value={formData.nextDate}
                onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Categoría</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nota</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                rows={2}
                placeholder="Descripción..."
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded font-medium flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {editingPayment ? 'Guardar Cambios' : 'Crear Pago'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LongTermDebtForm = () => {
    const [formData, setFormData] = useState(editingDebt || {
      name: '',
      type: 'LOAN',
      balance: '',
      originalAmount: '',
      interestRate: '0',
      monthlyPayment: '',
      remainingMonths: '',
      startDate: new Date().toISOString().split('T')[0],
      description: ''
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.balance) return;

      const debtData = {
        ...formData,
        balance: parseFloat(formData.balance),
        originalAmount: parseFloat(formData.originalAmount || formData.balance),
        interestRate: parseFloat(formData.interestRate),
        monthlyPayment: parseFloat(formData.monthlyPayment || 0),
        remainingMonths: formData.remainingMonths ? parseInt(formData.remainingMonths) : null
      };

      if (editingDebt) {
        const updated = longTermDebts.map(d => d.id === editingDebt.id ? { ...d, ...debtData } : d);
        setLongTermDebts(updated);
        saveData('longTermDebts', updated);
        setEditingDebt(null);
      } else {
        addLongTermDebt(debtData);
      }

      setShowAddLongTermDebt(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {editingDebt ? 'Editar' : 'Nueva'} Deuda a Largo Plazo
            </h3>
            <button onClick={() => {
              setShowAddLongTermDebt(false);
              setEditingDebt(null);
            }} className="text-slate-400 hover:text-slate-200">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Ej: Préstamo Auto, Hipoteca"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="LOAN">Préstamo Personal</option>
                <option value="AUTO">Financiamiento Auto</option>
                <option value="MORTGAGE">Hipoteca</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Saldo Actual (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Monto Original (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.originalAmount}
                onChange={(e) => setFormData({ ...formData, originalAmount: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tasa de Interés Anual (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Pago Mensual (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthlyPayment}
                onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Meses Restantes</label>
              <input
                type="number"
                value={formData.remainingMonths}
                onChange={(e) => setFormData({ ...formData, remainingMonths: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                rows={2}
                placeholder="Detalles adicionales..."
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded font-medium flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {editingDebt ? 'Guardar Cambios' : 'Crear Deuda'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PayCreditCardForm = () => {
    const [formData, setFormData] = useState({
      creditCardId: creditCards[0]?.id || '',
      fromAccountId: accounts[0]?.id || '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });

    const selectedCard = creditCards.find(c => c.id === formData.creditCardId);

    const handleSubmit = () => {
      if (!formData.amount || !formData.creditCardId || !formData.fromAccountId) return;

      payCreditCard({
        ...formData,
        amount: parseFloat(formData.amount)
      });

      setShowPayCreditCard(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Pagar Tarjeta de Crédito</h3>
            <button onClick={() => setShowPayCreditCard(false)} className="text-slate-400 hover:text-slate-200">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tarjeta de Crédito</label>
              <select
                value={formData.creditCardId}
                onChange={(e) => setFormData({ ...formData, creditCardId: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {creditCards.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - Deuda: {formatCurrency(c.balance)}</option>
                ))}
              </select>
            </div>
            {selectedCard && (
              <div className="bg-slate-700/50 p-3 rounded border border-slate-600">
                <p className="text-sm text-slate-400">Deuda Actual</p>
                <p className="text-lg font-semibold text-orange-400">{formatCurrency(selectedCard.balance)}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cuenta de Débito</label>
              <select
                value={formData.fromAccountId}
                onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} - {formatCurrency(a.balance)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Monto a Pagar (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 rounded font-medium flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Procesar Pago
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== VIEWS ====================

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <button
          onClick={() => setShowAddTransaction(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Nueva Transacción
        </button>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Caja Disponible</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(totalCash)}</p>
            </div>
            <DollarSign className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Deuda TDC</p>
              <p className="text-2xl font-bold text-orange-400">{formatCurrency(totalCreditCardDebt)}</p>
            </div>
            <CreditCard className="text-orange-500" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Deuda L.P.</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(totalLongTermDebt)}</p>
            </div>
            <AlertCircle className="text-red-500" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Activos</p>
              <p className="text-2xl font-bold text-purple-400">{formatCurrency(totalAssets)}</p>
            </div>
            <Package className="text-purple-500" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Patrimonio Neto</p>
              <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(netWorth)}
              </p>
            </div>
            <Activity className="text-blue-500" size={32} />
          </div>
        </div>
      </div>

      {/* KPIs de Control - Crédito */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Percent size={20} />
          Control de Crédito
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Límite Total de Crédito</span>
              <span className="text-white font-semibold">{formatCurrency(totalCreditLimit)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Deuda Total TDC</span>
              <span className="text-orange-400 font-semibold">{formatCurrency(totalCreditCardDebt)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-slate-300">Disponible</span>
              <span className={`font-semibold ${totalCreditLimit - totalCreditCardDebt >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(Math.max(0, totalCreditLimit - totalCreditCardDebt))}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  creditUtilizationPercent >= 100 ? 'bg-red-500' : creditUtilizationPercent >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, creditUtilizationPercent)}%` }}
              />
            </div>
            <p className={`text-sm text-right mt-2 font-semibold ${
              creditUtilizationPercent >= 100 ? 'text-red-400' : creditUtilizationPercent >= 80 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {creditUtilizationPercent.toFixed(1)}% utilizado
            </p>
          </div>
        </div>
      </div>

      {/* KPIs de Control - Deudas */}
      {longTermDebts.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Deudas a Largo Plazo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {longTermDebts.map(debt => (
              <div key={debt.id} className="bg-slate-700/50 p-4 rounded border border-slate-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-white">{debt.name}</p>
                    <p className="text-xs text-slate-400">{debt.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingDebt(debt);
                        setShowAddLongTermDebt(true);
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteLongTermDebt(debt.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-slate-400">Saldo</p>
                    <p className="font-semibold text-red-400">{formatCurrency(debt.balance)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Pago Mensual</p>
                    <p className="font-semibold text-white">{formatCurrency(debt.monthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Tasa</p>
                    <p className="font-semibold text-white">{debt.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Meses</p>
                    <p className="font-semibold text-white">{debt.remainingMonths || '∞'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Alerts */}
      {budgetStatus.some(b => b.status !== 'ok') && (
        <div className="space-y-2">
          {budgetStatus.filter(b => b.status !== 'ok').map((budget, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg flex items-start gap-3 border ${
                budget.status === 'exceeded'
                  ? 'bg-red-900/20 border-red-700/50 text-red-400'
                  : 'bg-yellow-900/20 border-yellow-700/50 text-yellow-400'
              }`}
            >
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{budget.name}</p>
                <p className="text-sm">
                  {budget.status === 'exceeded' ? '¡Presupuesto excedido!' : 'Cerca del límite'}
                  {' '}{formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Próximos Pagos (30 días)
          </h3>
          <div className="space-y-2">
            {upcomingPayments.slice(0, 5).map(payment => (
              <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-700/50 rounded border border-slate-600">
                <div>
                  <p className="font-medium text-white">{payment.name}</p>
                  <p className="text-sm text-slate-400">{formatDate(payment.nextDate)}</p>
                </div>
                <p className="font-semibold text-blue-400">{formatCurrency(payment.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {accounts.length === 0 && transactions.length === 0 && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-12 text-center">
          <DollarSign className="mx-auto text-slate-600 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">Comienza a gestionar tus finanzas</h3>
          <p className="text-slate-400 mb-6">Crea tu primera cuenta y transacción para empezar</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowAddAccount(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded"
            >
              Crear Cuenta
            </button>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-6 py-2 rounded border border-slate-600"
            >
              Agregar Transacción
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const TransactionsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Transacciones</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPayCreditCard(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <CreditCard size={16} /> Pagar TDC
          </button>
          <button
            onClick={() => setShowAddTransaction(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <input
            type="date"
            value={dateFilter.from}
            onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
          />
          <input
            type="date"
            value={dateFilter.to}
            onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Cuenta</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Categoría</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Comercio</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Nota</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Inversión</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Monto</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No hay transacciones
                  </td>
                </tr>
              ) : (
                filteredTransactions.slice(0, 50).map(t => {
                  const account = accounts.find(a => a.id === t.accountId);
                  const category = categories.find(c => c.id === t.categoryId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-700/50 transition">
                      <td className="px-4 py-3 text-sm text-slate-300">{formatDate(t.date)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          t.type === 'INCOME' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{account?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{category?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{t.merchant || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">{t.note}</td>
                      <td className="px-4 py-3 text-sm">
                        {t.isInvestment ? (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-900/30 text-blue-400">Sí</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-semibold ${t.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(Math.abs(t.amount))}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingTransaction(t);
                              setShowAddTransaction(true);
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-slate-900 text-sm text-slate-400 border-t border-slate-700">
          Mostrando {Math.min(filteredTransactions.length, 50)} de {filteredTransactions.length} transacciones
        </div>
      </div>
    </div>
  );

  const CreditCardsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Tarjetas de Crédito</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPayCreditCard(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <DollarSign size={16} /> Pagar
          </button>
          <button
            onClick={() => setShowAddCreditCard(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} /> Nueva Tarjeta
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creditCards.length === 0 ? (
          <div className="col-span-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-12 text-center">
            <CreditCard className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">Sin tarjetas de crédito</h3>
            <p className="text-slate-400 mb-6">Agrega tu primera tarjeta de crédito</p>
            <button
              onClick={() => setShowAddCreditCard(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded"
            >
              Crear Tarjeta
            </button>
          </div>
        ) : (
          creditCards.map(card => {
            const utilization = (card.balance / card.limit) * 100;
            return (
              <div key={card.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{card.name}</h3>
                    <p className="text-sm text-slate-400">{card.bank} •••• {card.lastDigits}</p>
                  </div>
                  <button
                    onClick={() => deleteCreditCard(card.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Saldo Actual</span>
                      <span className="text-white font-semibold">{formatCurrency(card.balance)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Límite</span>
                      <span className="text-slate-300">{formatCurrency(card.limit)}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          utilization >= 100 ? 'bg-red-500' : utilization >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, utilization)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 text-right mt-1">{utilization.toFixed(1)}% utilizado</p>
                  </div>

                  <div className="pt-3 border-t border-slate-700">
                    <p className="text-sm text-slate-400">Disponible</p>
                    <p className={`text-lg font-semibold ${
                      card.limit - card.balance >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(Math.max(0, card.limit - card.balance))}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500">Día de corte: {card.dueDay}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const BudgetsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Presupuestos</h2>
        <button
          onClick={() => setShowAddBudget(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo Presupuesto
        </button>
      </div>

      <div className="space-y-4">
        {budgetStatus.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-12 text-center">
            <Filter className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">Sin presupuestos</h3>
            <p className="text-slate-400 mb-6">Crea tu primer presupuesto para monitorear gastos</p>
            <button
              onClick={() => setShowAddBudget(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded"
            >
              Crear Presupuesto
            </button>
          </div>
        ) : (
          budgetStatus.map(budget => (
            <div
              key={budget.id}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{budget.name}</h3>
                  <p className="text-sm text-slate-400">Categoría: {categories.find(c => c.id === budget.categoryId)?.name}</p>
                </div>
                <button
                  onClick={() => deleteBudget(budget.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Gastado</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(budget.spent)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Límite</p>
                  <p className="text-lg font-semibold text-slate-300">{formatCurrency(budget.limit)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Disponible</p>
                  <p className={`text-lg font-semibold ${budget.remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(budget.remaining)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Progreso</span>
                  <span className={`font-semibold ${
                    budget.status === 'exceeded' ? 'text-red-400' : budget.status === 'warning' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {budget.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      budget.status === 'exceeded' ? 'bg-red-500' : budget.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, budget.percentage)}%` }}
                  />
                </div>
              </div>

              {budget.status === 'exceeded' && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">¡Presupuesto excedido por {formatCurrency(Math.abs(budget.remaining))}!</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const AccountsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Cuentas</h2>
        <button
          onClick={() => setShowAddAccount(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Nueva Cuenta
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.length === 0 ? (
          <div className="col-span-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-12 text-center">
            <Wallet className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">Sin cuentas</h3>
            <p className="text-slate-400 mb-6">Crea tu primera cuenta para empezar</p>
            <button
              onClick={() => setShowAddAccount(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded"
            >
              Crear Cuenta
            </button>
          </div>
        ) : (
          accounts.map(account => (
            <div key={account.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{account.name}</h3>
                  <p className="text-sm text-slate-400">{account.type}</p>
                </div>
                <button
                  onClick={() => deleteAccount(account.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-500">Balance</p>
                <p className={`text-2xl font-bold ${account.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(account.balance)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const AssetsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Activos</h2>
        <button
          onClick={() => setShowAddAsset(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo Activo
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.length === 0 ? (
          <div className="col-span-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-12 text-center">
            <Package className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">Sin activos</h3>
            <p className="text-slate-400 mb-6">Registra tus activos para monitorear su valor</p>
            <button
              onClick={() => setShowAddAsset(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded"
            >
              Crear Activo
            </button>
          </div>
        ) : (
          assets.map(asset => {
            const depreciation = asset.cost - asset.currentValue;
            const depreciationPercent = (depreciation / asset.cost) * 100;
            return (
              <div key={asset.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{asset.name}</h3>
                    <p className="text-sm text-slate-400">{asset.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingAsset(asset);
                        setShowAddAsset(true);
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteAsset(asset.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Costo Original</p>
                    <p className="text-lg font-semibold text-slate-300">{formatCurrency(asset.cost)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Valor Actual</p>
                    <p className="text-lg font-semibold text-green-400">{formatCurrency(asset.currentValue)}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Depreciación</p>
                    <p className="text-sm text-red-400">{formatCurrency(depreciation)} ({depreciationPercent.toFixed(1)}%)</p>
                  </div>

                  <div className="pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Comprado</p>
                    <p className="text-sm text-slate-400">{formatDate(asset.purchaseDate)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const PaymentsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Calendario de Pagos</h2>
        <button
          onClick={() => setShowAddPayment(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo Pago
        </button>
      </div>

      <div className="space-y-4">
        {payments.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-12 text-center">
            <Calendar className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">Sin pagos recurrentes</h3>
            <p className="text-slate-400 mb-6">Crea tu primer pago recurrente</p>
            <button
              onClick={() => setShowAddPayment(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded"
            >
              Crear Pago
            </button>
          </div>
        ) : (
          payments.map(payment => (
            <div
              key={payment.id}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{payment.name}</h3>
                  <p className="text-sm text-slate-400">{payment.note}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPayment(payment);
                      setShowAddPayment(true);
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deletePayment(payment.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Monto</p>
                  <p className="text-lg font-semibold text-blue-400">{formatCurrency(payment.amount)}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Frecuencia</p>
                  <p className="text-sm text-slate-300">{payment.type}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Recurrencia</p>
                  <p className="text-sm text-slate-300">{payment.recurrenceType}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Próximo Pago</p>
                  <p className="text-sm text-slate-300">{formatDate(payment.nextDate)}</p>
                </div>
              </div>

              {payment.recurrenceType === 'DEFINED' && payment.recurrenceCount && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-500">Pagos Restantes: {payment.recurrenceCount}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const LongTermDebtsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Deudas a Largo Plazo</h2>
        <button
          onClick={() => setShowAddLongTermDebt(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Nueva Deuda
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
          <p className="text-sm text-slate-400 mb-2">Deuda Total L.P.</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalLongTermDebt)}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
          <p className="text-sm text-slate-400 mb-2">Pago Mensual Total</p>
          <p className="text-2xl font-bold text-orange-400">
            {formatCurrency(longTermDebts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0))}
          </p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
          <p className="text-sm text-slate-400 mb-2">Deudas Activas</p>
          <p className="text-2xl font-bold text-blue-400">{longTermDebts.length}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
          <p className="text-sm text-slate-400 mb-2">Tasa Promedio</p>
          <p className="text-2xl font-bold text-purple-400">
            {longTermDebts.length > 0 
              ? (longTermDebts.reduce((sum, d) => sum + (d.interestRate || 0), 0) / longTermDebts.length).toFixed(2)
              : '0.00'}%
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {longTermDebts.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-12 text-center">
            <AlertCircle className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">Sin deudas a largo plazo</h3>
            <p className="text-slate-400 mb-6">Registra tus préstamos, hipotecas o financiamientos</p>
            <button
              onClick={() => setShowAddLongTermDebt(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded"
            >
              Crear Deuda
            </button>
          </div>
        ) : (
          longTermDebts.map(debt => {
            const progress = (debt.balance / debt.originalAmount) * 100;
            const monthlyInterest = (debt.balance * debt.interestRate) / 100 / 12;
            return (
              <div
                key={debt.id}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{debt.name}</h3>
                    <p className="text-sm text-slate-400">{debt.type} • Iniciado: {formatDate(debt.startDate)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingDebt(debt);
                        setShowAddLongTermDebt(true);
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteLongTermDebt(debt.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Saldo Actual</p>
                    <p className="text-lg font-semibold text-red-400">{formatCurrency(debt.balance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Monto Original</p>
                    <p className="text-lg font-semibold text-slate-300">{formatCurrency(debt.originalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Pago Mensual</p>
                    <p className="text-lg font-semibold text-blue-400">{formatCurrency(debt.monthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tasa Anual</p>
                    <p className="text-lg font-semibold text-purple-400">{debt.interestRate}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Interés Mensual Est.</p>
                    <p className="text-sm font-semibold text-orange-400">{formatCurrency(monthlyInterest)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Meses Restantes</p>
                    <p className="text-sm font-semibold text-white">{debt.remainingMonths || '∞'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progreso de Pago</span>
                    <span className="text-white font-semibold">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>

                {debt.description && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Descripción</p>
                    <p className="text-sm text-slate-300">{debt.description}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const InvestmentsView = () => {
    const investmentTransactions = transactions.filter(t => t.isInvestment);
    const totalInvested = investmentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const monthlyInvested = investmentTransactions
      .filter(t => t.date.startsWith(new Date().toISOString().substring(0, 7)))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-white">Inversiones</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Invertido</p>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalInvested)}</p>
              </div>
              <TrendingUpIcon className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Invertido Este Mes</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(monthlyInvested)}</p>
              </div>
              <Zap className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">% del Flujo</p>
                <p className="text-2xl font-bold text-purple-400">
                  {expenseFlow + monthlyInvested > 0 
                    ? ((monthlyInvested / (expenseFlow + monthlyInvested)) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <BarChart3 className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Descripción</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Categoría</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Cuenta</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {investmentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No hay inversiones registradas
                    </td>
                  </tr>
                ) : (
                  investmentTransactions.slice(0, 50).map(t => {
                    const account = accounts.find(a => a.id === t.accountId);
                    const category = categories.find(c => c.id === t.categoryId);
                    return (
                      <tr key={t.id} className="hover:bg-slate-700/50 transition">
                        <td className="px-4 py-3 text-sm text-slate-300">{formatDate(t.date)}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{t.note || t.merchant || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{category?.name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{account?.name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-blue-400">
                          {formatCurrency(Math.abs(t.amount))}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ReportsView = () => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyExpenses = transactions
      .filter(t => t.date.startsWith(currentMonth) && t.type === 'EXPENSE' && !t.isInvestment)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyIncome = transactions
      .filter(t => t.date.startsWith(currentMonth) && t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expensesByCategory = categories.map(cat => {
      const total = transactions
        .filter(t => t.categoryId === cat.id && t.type === 'EXPENSE' && !t.isInvestment)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return { ...cat, total };
    }).filter(c => c.total > 0);

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Reportes</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Ingresos (Mes Actual)</p>
            <p className="text-3xl font-bold text-green-400">{formatCurrency(monthlyIncome)}</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Gastos (Mes Actual)</p>
            <p className="text-3xl font-bold text-red-400">{formatCurrency(monthlyExpenses)}</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Balance (Mes Actual)</p>
            <p className={`text-3xl font-bold ${monthlyIncome - monthlyExpenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(monthlyIncome - monthlyExpenses)}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Gastos por Categoría</h3>
          <div className="space-y-3">
            {expensesByCategory.length === 0 ? (
              <p className="text-slate-400">No hay gastos registrados</p>
            ) : (
              expensesByCategory.map(cat => {
                const percentage = (cat.total / monthlyExpenses) * 100;
                return (
                  <div key={cat.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{cat.name}</span>
                      <span className="text-slate-400">{formatCurrency(cat.total)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Resumen Financiero</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-2">Caja Total</p>
              <p className="text-xl font-semibold text-green-400">{formatCurrency(totalCash)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Deuda TDC</p>
              <p className="text-xl font-semibold text-orange-400">{formatCurrency(totalCreditCardDebt)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Deuda L.P.</p>
              <p className="text-xl font-semibold text-red-400">{formatCurrency(totalLongTermDebt)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Activos</p>
              <p className="text-xl font-semibold text-purple-400">{formatCurrency(totalAssets)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Patrimonio Neto</p>
              <p className={`text-xl font-semibold ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(netWorth)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Header */}
      <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">André Finance</h1>
            <p className="text-xs text-slate-400">Sistema Integral de Finanzas Personales</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto mt-6 px-4 gap-6 pb-8">
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-4 h-fit sticky top-24">
          <nav className="space-y-1">
            {[
              { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
              { id: 'transactions', icon: FileText, label: 'Transacciones' },
              { id: 'creditcards', icon: CreditCard, label: 'Tarjetas de Crédito' },
              { id: 'longtermdebts', icon: AlertCircle, label: 'Deudas L.P.' },
              { id: 'budgets', icon: Filter, label: 'Presupuestos' },
              { id: 'accounts', icon: Wallet, label: 'Cuentas' },
              { id: 'assets', icon: Package, label: 'Activos' },
              { id: 'payments', icon: Calendar, label: 'Calendario de Pagos' },
              { id: 'investments', icon: TrendingUpIcon, label: 'Inversiones' },
              { id: 'reports', icon: BarChart3, label: 'Reportes' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-600/20 text-blue-400 font-medium border border-blue-600/50'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'transactions' && <TransactionsView />}
          {currentView === 'creditcards' && <CreditCardsView />}
          {currentView === 'longtermdebts' && <LongTermDebtsView />}
          {currentView === 'budgets' && <BudgetsView />}
          {currentView === 'accounts' && <AccountsView />}
          {currentView === 'assets' && <AssetsView />}
          {currentView === 'payments' && <PaymentsView />}
          {currentView === 'investments' && <InvestmentsView />}
          {currentView === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Modals */}
      {showAddTransaction && <TransactionForm />}
      {showAddAccount && <AccountForm />}
      {showAddCreditCard && <CreditCardForm />}
      {showAddBudget && <BudgetForm />}
      {showAddAsset && <AssetForm />}
      {showAddPayment && <PaymentForm />}
      {showPayCreditCard && <PayCreditCardForm />}
      {showAddLongTermDebt && <LongTermDebtForm />}
    </div>
  );
}
