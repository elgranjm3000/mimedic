import { db, ensureDb } from './db';

export interface BcvRate {
  rate: number | null;
  updatedAt: string | null;
}

const MAX_AGE_MS = 6 * 60 * 60 * 1000; // refrescar cada 6 h

/** Lee la última tasa conocida de la base de datos. */
async function storedRate(): Promise<BcvRate> {
  const result = await db.execute({
    sql: `SELECT rate, "updatedAt" FROM exchange_rates WHERE code = 'USD_VES'`,
  });
  if (result.rows.length === 0) return { rate: null, updatedAt: null };
  return {
    rate: Number(result.rows[0].rate),
    updatedAt: result.rows[0].updatedAt as string,
  };
}

/** Obtiene la tasa BCV (USD→VES): API pública con respaldo local; nunca lanza. */
export async function getBcvRate(): Promise<BcvRate> {
  await ensureDb();
  const stored = await storedRate();

  const fresh =
    stored.rate !== null &&
    stored.updatedAt !== null &&
    Date.now() - new Date(stored.updatedAt).getTime() < MAX_AGE_MS;
  if (fresh) return stored;

  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      const rate = Number(data?.promedio ?? data?.precio);
      if (rate > 0) {
        const now = new Date().toISOString();
        await db.execute({
          sql: `INSERT INTO exchange_rates (code, rate, "updatedAt") VALUES ('USD_VES', ?, ?)
                ON CONFLICT(code) DO UPDATE SET rate = excluded.rate, "updatedAt" = excluded."updatedAt"`,
          args: [rate, now],
        });
        return { rate, updatedAt: now };
      }
    }
  } catch {
    // sin conexión o API caída: usar la última tasa conocida
  }

  return stored;
}
