export const dynamic = "force-dynamic";

import { makeCollectionHandlers, inventoryItemsConfig } from '@/lib/rest';

export const { GET, POST } = makeCollectionHandlers(inventoryItemsConfig);
