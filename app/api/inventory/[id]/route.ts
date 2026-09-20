export const dynamic = "force-dynamic";

import { makeItemHandlers, inventoryItemsConfig } from '@/lib/rest';

export const { GET, PATCH, DELETE } = makeItemHandlers(inventoryItemsConfig);
