export const dynamic = "force-dynamic";

import { invoicesConfig, makeCollectionHandlers } from '@/lib/rest';

export const { GET, POST } = makeCollectionHandlers(invoicesConfig);
