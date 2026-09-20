export const dynamic = "force-dynamic";

import { makeItemHandlers, inventoryCategoriesConfig } from '@/lib/rest';

export const { GET, PATCH, DELETE } = makeItemHandlers(inventoryCategoriesConfig);
