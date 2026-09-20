export const dynamic = "force-dynamic";

import { makeCollectionHandlers, inventoryCategoriesConfig } from '@/lib/rest';

export const { GET, POST } = makeCollectionHandlers(inventoryCategoriesConfig);
