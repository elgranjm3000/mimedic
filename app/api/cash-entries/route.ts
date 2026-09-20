export const dynamic = "force-dynamic";

import { makeCollectionHandlers, cashEntriesConfig } from '@/lib/rest';

export const { GET, POST } = makeCollectionHandlers(cashEntriesConfig);
