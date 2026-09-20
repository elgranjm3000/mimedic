export const dynamic = "force-dynamic";

import { makeCollectionHandlers, stockMovementsConfig } from '@/lib/rest';

export const { GET, POST } = makeCollectionHandlers(stockMovementsConfig);
