'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2,
  Pencil,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventory } from '@/hooks/use-inventory';
import { useOrgSettings } from '@/hooks/use-org-settings';
import { useAuth } from '@/contexts/auth-context';
import { formatMoney } from '@/lib/format';
import { InventoryItem, StockMovementType } from '@/lib/types';
import { cn } from '@/lib/utils';

const UNITS = ['unidad', 'caja', 'frasco', 'paquete', 'sobre', 'ampolla', 'rollo'];
const todayStr = () => new Date().toISOString().split('T')[0];

export default function InventoryPage() {
  const { user } = useAuth();
  const { currency } = useOrgSettings();
  const { items, movements, loading, addItem, updateItem, deleteItem, addMovement } = useInventory();

  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);

  // dialog de ítem (nuevo/editar)
  const [itemDialog, setItemDialog] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('unidad');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [cost, setCost] = useState('');
  const [supplier, setSupplier] = useState('');

  // dialog de movimiento
  const [moveDialog, setMoveDialog] = useState<InventoryItem | null>(null);
  const [moveType, setMoveType] = useState<StockMovementType>('entrada');
  const [moveQty, setMoveQty] = useState('');
  const [moveReason, setMoveReason] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const matches = !q || i.name.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q);
      const low = lowOnly ? i.stock <= i.minStock : true;
      return matches && low;
    });
  }, [items, search, lowOnly]);

  const stats = useMemo(() => {
    const lowCount = items.filter((i) => i.stock <= i.minStock).length;
    const value = items.reduce((s, i) => s + Number(i.stock) * Number(i.cost ?? 0), 0);
    return { count: items.length, lowCount, value };
  }, [items]);

  const openNew = () => {
    setEditing(null);
    setName(''); setCategory(''); setUnit('unidad'); setStock(''); setMinStock(''); setCost(''); setSupplier('');
    setItemDialog(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setName(item.name); setCategory(item.category ?? ''); setUnit(item.unit);
    setStock(String(item.stock)); setMinStock(String(item.minStock));
    setCost(item.cost?.toString() ?? ''); setSupplier(item.supplier ?? '');
    setItemDialog(true);
  };

  const handleSaveItem = async () => {
    if (!name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    const data = {
      name: name.trim(),
      category: category.trim() || undefined,
      unit,
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 0,
      cost: cost ? Number(cost) : null,
      supplier: supplier.trim() || null,
    };
    setSaving(true);
    try {
      if (editing) {
        await updateItem(editing.id, data);
        toast.success('Ítem actualizado');
      } else {
        await addItem(data);
        toast.success('Ítem agregado al inventario');
      }
      setItemDialog(false);
    } catch {
      toast.error('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const openMove = (item: InventoryItem, type: StockMovementType) => {
    setMoveDialog(item);
    setMoveType(type);
    setMoveQty('');
    setMoveReason('');
  };

  const handleSaveMove = async () => {
    const qty = Number(moveQty);
    if (!moveDialog || !qty || qty <= 0) {
      toast.error('Indicá una cantidad válida');
      return;
    }
    const delta = moveType === 'entrada' ? qty : -qty;
    const newStock = Number(moveDialog.stock) + delta;
    if (newStock < 0) {
      toast.error('No hay stock suficiente para esa salida');
      return;
    }
    setSaving(true);
    try {
      await addMovement(
        {
          itemId: moveDialog.id,
          itemName: moveDialog.name,
          type: moveType,
          quantity: qty,
          reason: moveReason.trim() || undefined,
          date: todayStr(),
          registeredBy: user ? `${user.firstName} ${user.lastName}` : null,
        },
        newStock,
        moveDialog.id
      );
      toast.success(moveType === 'entrada' ? 'Entrada registrada' : 'Salida registrada');
      setMoveDialog(null);
    } catch {
      toast.error('No se pudo registrar el movimiento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    if (confirm(`¿Eliminar "${item.name}" del inventario?`)) {
      try {
        await deleteItem(item.id);
        toast.success('Ítem eliminado');
      } catch {
        toast.error('No se pudo eliminar');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Boxes className="h-8 w-8 text-teal-600" />
            Inventario
          </h1>
          <p className="text-gray-600 mt-1">Insumos médicos con control de stock y reposición</p>
        </div>
        <Button onClick={openNew} className="flex items-center gap-2 min-h-[44px]">
          <Plus className="h-4 w-4" />
          Nuevo Ítem
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-gray-600">Ítems en inventario</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.count}</p>
          </CardContent>
        </Card>
        <Card className={cn(stats.lowCount > 0 && 'ring-1 ring-amber-300')}>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
              <AlertTriangle className={cn('h-4 w-4', stats.lowCount > 0 ? 'text-amber-500' : 'text-gray-400')} />
              Bajo stock
            </p>
            <p className={cn('text-2xl font-bold tabular-nums', stats.lowCount > 0 ? 'text-amber-600' : 'text-gray-900')}>
              {stats.lowCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-gray-600">Valor estimado</p>
            <p className="text-2xl font-bold text-teal-700 tabular-nums">{formatMoney(stats.value, currency)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={lowOnly ? 'default' : 'outline'}
            onClick={() => setLowOnly(!lowOnly)}
            className="flex items-center gap-2 min-h-[40px]"
          >
            <AlertTriangle className="h-4 w-4" />
            Solo bajo stock
          </Button>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Boxes className="h-14 w-14 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600">
                {items.length === 0 ? 'Inventario vacío — agregá tu primer insumo.' : 'Sin resultados para este filtro.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left">
                    <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Ítem</th>
                    <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Stock</th>
                    <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Costo unit.</th>
                    <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Proveedor</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const low = item.stock <= item.minStock;
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2.5 px-4">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.category || '—'}</p>
                        </td>
                        <td className="py-2.5 px-4">
                          <Badge
                            className={cn(
                              low ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            )}
                          >
                            {item.stock} {item.unit}{low && ' · reponer'}
                          </Badge>
                          <p className="text-xs text-gray-400 mt-0.5">mín: {item.minStock}</p>
                        </td>
                        <td className="py-2.5 px-4 tabular-nums text-gray-600">
                          {item.cost ? formatMoney(item.cost, currency) : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-gray-600">{item.supplier || '—'}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" title="Entrada de stock" onClick={() => openMove(item, 'entrada')}>
                              <ArrowDownCircle className="h-4 w-4 text-emerald-600" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Salida de stock" onClick={() => openMove(item, 'salida')}>
                              <ArrowUpCircle className="h-4 w-4 text-red-600" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Editar" onClick={() => openEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Eliminar"
                              onClick={() => handleDelete(item)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movimientos recientes */}
      {movements.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-teal-600" />
              Movimientos recientes
            </h3>
            <div className="space-y-1.5">
              {movements.slice(0, 10).map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-1.5">
                  <span>
                    <Badge
                      className={cn(
                        'mr-2',
                        m.type === 'entrada' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      )}
                    >
                      {m.type === 'entrada' ? '+' : '−'}{m.quantity}
                    </Badge>
                    {m.itemName}
                    {m.reason && <span className="text-gray-500 text-xs"> — {m.reason}</span>}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {format(new Date(m.date), 'd MMM', { locale: es })} · {m.registeredBy ?? ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog ítem */}
      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar ítem' : 'Nuevo ítem de inventario'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="i-name">Nombre</Label>
              <Input id="i-name" placeholder="Ej: Guantes de nitrilo (talla M)" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="i-cat">Categoría</Label>
                <Input id="i-cat" placeholder="Ej: EPP, Inyección" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Unidad</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="i-stock">Stock actual</Label>
                <Input id="i-stock" type="number" inputMode="decimal" value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="i-min">Stock mínimo (reposición)</Label>
                <Input id="i-min" type="number" inputMode="decimal" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="i-cost">Costo unitario</Label>
                <Input id="i-cost" type="number" step="0.01" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="i-sup">Proveedor</Label>
                <Input id="i-sup" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setItemDialog(false)} disabled={saving}>Cancelar</Button>
              <Button onClick={handleSaveItem} disabled={saving}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog movimiento */}
      <Dialog open={Boolean(moveDialog)} onOpenChange={(open) => !open && setMoveDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {moveType === 'entrada'
                ? <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
                : <ArrowUpCircle className="h-5 w-5 text-red-600" />}
              {moveType === 'entrada' ? 'Entrada' : 'Salida'} — {moveDialog?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Stock actual: <strong className="text-gray-900">{moveDialog?.stock} {moveDialog?.unit}</strong>
            </p>
            <div className="space-y-2">
              <Label htmlFor="m-qty">Cantidad</Label>
              <Input id="m-qty" type="number" inputMode="decimal" value={moveQty} onChange={(e) => setMoveQty(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-reason">Motivo</Label>
              <Input
                id="m-reason"
                placeholder={moveType === 'entrada' ? 'Ej: Compra a proveedor' : 'Ej: Uso en consulta'}
                value={moveReason}
                onChange={(e) => setMoveReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setMoveDialog(null)} disabled={saving}>Cancelar</Button>
              <Button onClick={handleSaveMove} disabled={saving}>Registrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
