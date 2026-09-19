'use client';

import { ArrowLeftRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useBcvRate } from '@/hooks/use-bcv-rate';
import { useOrgSettings } from '@/hooks/use-org-settings';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/** Tarjeta con la tasa BCV vigente. Solo se muestra en organizaciones venezolanas (USD o VES). */
export function BcvRateCard() {
  const { currency } = useOrgSettings();
  const enabled = currency === 'USD' || currency === 'VES';
  const { rate, updatedAt } = useBcvRate(enabled);

  if (!enabled) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tasa BCV</p>
            {rate ? (
              <>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  Bs {rate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-400">por 1 USD</p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-1">No disponible sin conexión</p>
            )}
          </div>
          <div className="p-3 rounded-full bg-teal-100">
            <ArrowLeftRight className="h-6 w-6 text-teal-600" />
          </div>
        </div>
        {updatedAt && (
          <p className="mt-2 text-xs text-gray-400">
            Actualizada: {format(new Date(updatedAt), 'd MMM yyyy, HH:mm', { locale: es })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
