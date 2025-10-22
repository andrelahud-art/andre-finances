'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Payment } from '@/types';

export default function CalendarPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/calendar/payments');
        if (response.ok) {
          const data = await response.json();
          setPayments(data);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  const now = new Date();
  const nextMonth = addDays(now, 30);
  const upcomingPayments = payments.filter(p => {
    const dueDate = new Date(p.dueDate);
    return dueDate >= now && dueDate <= nextMonth;
  });

  const overdue = payments.filter(p => {
    const dueDate = new Date(p.dueDate);
    return dueDate < now;
  });

  const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + Number(p.totalDue), 0);
  const totalOverdue = overdue.reduce((sum, p) => sum + Number(p.totalDue), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Calendario de Pagos</h1>
            <p className="text-slate-600 mt-2">Próximos vencimientos de deudas</p>
          </div>
          <Calendar className="w-12 h-12 text-blue-600" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Próximos 30 Días</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${totalUpcoming.toLocaleString('es-MX')}
              </div>
              <p className="text-xs text-slate-500 mt-1">{upcomingPayments.length} pagos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Vencidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totalOverdue.toLocaleString('es-MX')}
              </div>
              <p className="text-xs text-slate-500 mt-1">{overdue.length} pagos vencidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Deudas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ${payments.reduce((sum, p) => sum + Number(p.totalDue), 0).toLocaleString('es-MX')}
              </div>
              <p className="text-xs text-slate-500 mt-1">{payments.length} pagos programados</p>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Payments */}
        {overdue.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Pagos Vencidos
              </CardTitle>
              <CardDescription>Estos pagos ya pasaron su fecha de vencimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deuda</TableHead>
                      <TableHead>Fecha Vencimiento</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Interés</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Días Vencido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdue.map((payment) => {
                      const daysOverdue = Math.floor((now.getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <TableRow key={payment.id} className="bg-red-100">
                          <TableCell className="font-semibold">{payment.debt?.name}</TableCell>
                          <TableCell>{format(new Date(payment.dueDate), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>${Number(payment.principalDue).toLocaleString('es-MX')}</TableCell>
                          <TableCell>${Number(payment.interestDue).toLocaleString('es-MX')}</TableCell>
                          <TableCell className="font-semibold">${Number(payment.totalDue).toLocaleString('es-MX')}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{daysOverdue} días</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Pagos (30 días)</CardTitle>
            <CardDescription>Pagos programados para los próximos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deuda</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead>Días Restantes</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Interés</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingPayments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((payment) => {
                    const daysUntil = Math.ceil((new Date(payment.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const isUrgent = daysUntil <= 7;
                    return (
                      <TableRow key={payment.id} className={isUrgent ? 'bg-yellow-50' : ''}>
                        <TableCell className="font-semibold">{payment.debt?.name}</TableCell>
                        <TableCell>{format(new Date(payment.dueDate), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={isUrgent ? 'destructive' : 'secondary'}>
                            {daysUntil} días
                          </Badge>
                        </TableCell>
                        <TableCell>${Number(payment.principalDue).toLocaleString('es-MX')}</TableCell>
                        <TableCell>${Number(payment.interestDue).toLocaleString('es-MX')}</TableCell>
                        <TableCell className="font-semibold">${Number(payment.totalDue).toLocaleString('es-MX')}</TableCell>
                        <TableCell>
                          {isUrgent ? (
                            <Badge className="bg-orange-500">Urgente</Badge>
                          ) : (
                            <Badge className="bg-green-500">Programado</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/">Volver al Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
