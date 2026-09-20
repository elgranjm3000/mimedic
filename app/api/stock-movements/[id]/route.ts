export const dynamic = "force-dynamic";

import { makeItemHandlers, stockMovementsConfig } from '@/lib/rest';

export const { GET, PATCH, DELETE } = makeItemHandlers(stockMovementsConfig);
