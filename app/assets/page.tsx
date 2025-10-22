'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, inventoryRes] = await Promise.all([
          fetch('/api/assets'),
          fetch('/api/inventory'),
        ]);

        if (assetsRes.ok) {
          const assetsData = await assetsRes.json();
          setAssets(Array.isArray(assetsData) ? assetsData : []);
        }
        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json();
          setInventory(Array.isArray(inventoryData) ? inventoryData : []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>;
  }

  const totalAssetsValue = assets.reduce((sum, asset) => sum + (Number(asset.currentValue) || 0), 0);
  const totalCost = assets.reduce((sum, asset) => sum + (Number(asset.cost) || 0), 0);
  const totalDepreciation = totalCost - totalAssetsValue;
  const totalInventoryValue = inventory.reduce((sum, item) => sum + ((item.quantity || 0) * (Number(item.costAverage) || 0)), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Activos e Inventario</h1>
            <p className="text-slate-600 mt-2">Gestión de bienes y existencias</p>
          </div>
          <Building2 className="w-12 h-12 text-blue-600" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Valor Activos Fijos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${totalAssetsValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-slate-500 mt-1">{assets.length} activos registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Depreciación Acumulada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                -${totalDepreciation.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-slate-500 mt-1">Valor reducido</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Valor Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalInventoryValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-slate-500 mt-1">{inventory.length} productos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assets">Activos Fijos</TabsTrigger>
            <TabsTrigger value="inventory">Inventario</TabsTrigger>
          </TabsList>

          {/* Assets Tab */}
          <TabsContent value="assets">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Mis Activos Fijos</CardTitle>
                    <CardDescription>Vehículos, equipos y propiedades</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Activo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {assets.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No hay activos registrados
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Fecha Compra</TableHead>
                          <TableHead>Costo Original</TableHead>
                          <TableHead>Depreciación</TableHead>
                          <TableHead>Valor Actual</TableHead>
                          <TableHead>Vida Útil</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assets.map((asset) => {
                          const cost = Number(asset.cost) || 0;
                          const currentValue = Number(asset.currentValue) || 0;
                          const depreciation = cost - currentValue;
                          return (
                            <TableRow key={asset.id}>
                              <TableCell className="font-semibold">{asset.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{asset.type}</Badge>
                              </TableCell>
                              <TableCell>{format(new Date(asset.purchaseDate), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>${cost.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</TableCell>
                              <TableCell className="text-orange-600">-${depreciation.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</TableCell>
                              <TableCell className="font-semibold">${currentValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</TableCell>
                              <TableCell>{Math.ceil((asset.usefulLifeMonths || 60) / 12)} años</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Inventario</CardTitle>
                    <CardDescription>Existencias valoradas</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Producto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {inventory.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No hay productos en inventario
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Costo Unitario</TableHead>
                          <TableHead>Valor Total</TableHead>
                          <TableHead>Método Valuación</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventory.map((item) => {
                          const costAverage = Number(item.costAverage) || 0;
                          const totalValue = (item.quantity || 0) * costAverage;
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                              <TableCell className="font-semibold">{item.name}</TableCell>
                              <TableCell>{item.quantity?.toLocaleString('es-MX')}</TableCell>
                              <TableCell>${costAverage.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</TableCell>
                              <TableCell className="font-semibold">${totalValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{item.valuationMethod}</Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
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
