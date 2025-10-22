'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

const debtSchema = z.object({
  name: z.string(),
  principal: z.string(),
  rateAnnual: z.string(),
  startDate: z.string(),
  termMonths: z.string(),
  accountId: z.string(),
});

type DebtForm = z.infer<typeof debtSchema>;

export default function DebtsPage() {
  const [debts, setDebts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);

  const form = useForm<DebtForm>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
      termMonths: '12',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [debtsRes, accRes] = await Promise.all([
          fetch('/api/debts'),
          fetch('/api/accounts'),
        ]);

        if (debtsRes.ok) setDebts(await debtsRes.json());
        if (accRes.ok) setAccounts(await accRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: DebtForm) => {
    try {
      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          principal: parseFloat(data.principal),
          rateAnnual: parseFloat(data.rateAnnual),
          termMonths: parseInt(data.termMonths),
          startDate: new Date(data.startDate).toISOString(),
        }),
      });

      if (response.ok) {
        const newDebt = await response.json();
        setDebts([newDebt.debt, ...debts]);
        form.reset();
        setOpen(false);
      }
    } catch (error) {
      console.error('Error creating debt:', error);
    }
  };

  const fetchSchedule = async (debtId: string) => {
    try {
      const response = await fetch(`/api/debts/${debtId}/schedule`);
      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
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
            <h1 className="text-4xl font-bold text-slate-900">Deudas</h1>
            <p className="text-slate-600 mt-2">Gestiona tus obligaciones financieras</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Deuda
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Deuda</DialogTitle>
                <DialogDescription>Agrega una nueva deuda a tu cartera</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Camioneta Ford" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="principal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto Principal</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rateAnnual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tasa Anual (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Inicio</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="termMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plazo (meses)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuenta Pasivo</FormLabel>
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
                  <Button type="submit" className="w-full">
                    Guardar
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Deudas Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Deuda Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${debts.reduce((sum, d) => sum + Number(d.principal), 0).toLocaleString('es-MX')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Deudas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{debts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Próximo Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ${debts[0]?.schedules?.[0]?.totalDue?.toLocaleString('es-MX') || '0'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deudas Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Deudas</CardTitle>
            <CardDescription>Listado de todas tus obligaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Tasa Anual</TableHead>
                    <TableHead>Plazo</TableHead>
                    <TableHead>Próximo Pago</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="font-semibold">{debt.name}</TableCell>
                      <TableCell>${Number(debt.principal).toLocaleString('es-MX')}</TableCell>
                      <TableCell>{debt.rateAnnual}%</TableCell>
                      <TableCell>{debt.termMonths} meses</TableCell>
                      <TableCell>
                        {debt.schedules?.[0]?.dueDate
                          ? format(new Date(debt.schedules[0].dueDate), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDebt(debt);
                            fetchSchedule(debt.id);
                          }}
                        >
                          Ver Plan
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Modal */}
        {selectedDebt && (
          <Dialog open={!!selectedDebt} onOpenChange={() => setSelectedDebt(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Plan de Amortización: {selectedDebt.name}</DialogTitle>
                <DialogDescription>Próximos pagos programados</DialogDescription>
              </DialogHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Fecha Vencimiento</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Interés</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.slice(0, 12).map((row, idx) => (
                      <TableRow key={row.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{format(new Date(row.dueDate), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>${Number(row.principalDue).toLocaleString('es-MX')}</TableCell>
                        <TableCell>${Number(row.interestDue).toLocaleString('es-MX')}</TableCell>
                        <TableCell className="font-semibold">${Number(row.totalDue).toLocaleString('es-MX')}</TableCell>
                        <TableCell>${Number(row.balance || 0).toLocaleString('es-MX')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <div className="mt-8">
          <Button asChild variant="outline">
            <a href="/">Volver al Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
