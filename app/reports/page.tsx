'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

export default function ReportsPage() {
  const [pnlData, setPnlData] = useState<any>(null);
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        const [pnlRes, cfRes] = await Promise.all([
          fetch(`/api/reports/pnl?period=${period}`),
          fetch(`/api/reports/cashflow?from=${from}&to=${to}`),
        ]);

        if (pnlRes.ok) setPnlData(await pnlRes.json());
        if (cfRes.ok) {
          const data = await cfRes.json();
          setCashFlowData(data.series || []);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  const pnlChartData = [
    { name: 'Ingresos', value: pnlData?.income || 0 },
    { name: 'COGS', value: pnlData?.cogs || 0 },
    { name: 'Gastos', value: pnlData?.opex || 0 },
    { name: 'Intereses', value: pnlData?.interest || 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Reportes</h1>
            <p className="text-slate-600 mt-2">Análisis financiero detallado</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        <Tabs defaultValue="pnl" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pnl">Estado de Resultados</TabsTrigger>
            <TabsTrigger value="cashflow">Flujo de Caja</TabsTrigger>
            <TabsTrigger value="comparison">Comparativa</TabsTrigger>
          </TabsList>

          {/* P&L Report */}
          <TabsContent value="pnl" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Resultados</CardTitle>
                  <CardDescription>Octubre 2025</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-slate-600">Ingresos</span>
                    <span className="font-semibold text-green-600">
                      +${pnlData?.income?.toLocaleString('es-MX') || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-slate-600">Costo de Bienes</span>
                    <span className="font-semibold text-red-600">
                      -${pnlData?.cogs?.toLocaleString('es-MX') || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-slate-600">Gastos Operativos</span>
                    <span className="font-semibold text-red-600">
                      -${pnlData?.opex?.toLocaleString('es-MX') || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-slate-600">Intereses</span>
                    <span className="font-semibold text-red-600">
                      -${pnlData?.interest?.toLocaleString('es-MX') || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-slate-600">Impuestos</span>
                    <span className="font-semibold text-red-600">
                      -${pnlData?.tax?.toLocaleString('es-MX') || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 bg-slate-100 p-3 rounded">
                    <span className="font-bold">Utilidad Neta</span>
                    <span className={`font-bold text-lg ${pnlData?.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${pnlData?.netIncome?.toLocaleString('es-MX') || '0'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Composición de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={pnlChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cash Flow Report */}
          <TabsContent value="cashflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Flujo de Caja Diario</CardTitle>
                <CardDescription>Movimientos de efectivo por día</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" name="Flujo Neto" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen de Flujo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Flujo Promedio Diario</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${(cashFlowData.reduce((sum, d) => sum + d.amount, 0) / cashFlowData.length).toLocaleString('es-MX')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Flujo Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${cashFlowData.reduce((sum, d) => sum + d.amount, 0).toLocaleString('es-MX')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Días Analizados</p>
                    <p className="text-2xl font-bold text-slate-900">{cashFlowData.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison */}
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparativa Mensual</CardTitle>
                <CardDescription>Proyección vs Real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  Datos de comparativa disponibles próximamente
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <Button asChild variant="outline">
            <a href="/">Volver al Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
