export const dynamic = "force-dynamic";

import { makeCollectionHandlers, suppliersConfig } from '@/lib/rest';

export const { GET, POST } = makeCollectionHandlers(suppliersConfig);
