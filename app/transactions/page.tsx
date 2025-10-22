'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Upload } from 'lucide-react';
import { format } from 'date-fns';

const transactionSchema = z.object({
  date: z.string(),
  amount: z.string(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT']),
  accountId: z.string(),
  categoryId: z.string().optional(),
  note: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, accRes, catRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/accounts'),
          fetch('/api/categories'),
        ]);

        if (txRes.ok) {
          const data = await txRes.json();
          setTransactions(data.data || []);
        }
        if (accRes.ok) setAccounts(await accRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: TransactionForm) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
          date: new Date(data.date).toISOString(),
        }),
      });

      if (response.ok) {
        const newTx = await response.json();
        setTransactions([newTx, ...transactions]);
        form.reset();
        setOpen(false);
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Transacciones</h1>
            <p className="text-slate-600 mt-2">Gestiona todos tus movimientos</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Transacción
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Transacción</DialogTitle>
                  <DialogDescription>Registra un nuevo movimiento</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INCOME">Ingreso</SelectItem>
                              <SelectItem value="EXPENSE">Gasto</SelectItem>
                              <SelectItem value="TRANSFER">Transferencia</SelectItem>
                              <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cuenta</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una cuenta" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                  {acc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría (Opcional)</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nota (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Descripción..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Guardar
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Transacciones</CardTitle>
            <CardDescription>Últimas transacciones registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(new Date(tx.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{tx.note || '-'}</TableCell>
                      <TableCell>{tx.account?.name}</TableCell>
                      <TableCell>{tx.category?.name || '-'}</TableCell>
                      <TableCell className={`text-right font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}${Math.abs(Number(tx.amount)).toLocaleString('es-MX')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button asChild variant="outline">
            <a href="/">Volver al Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
