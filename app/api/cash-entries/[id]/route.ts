export const dynamic = "force-dynamic";

import { makeItemHandlers, cashEntriesConfig } from '@/lib/rest';

export const { GET, PATCH, DELETE } = makeItemHandlers(cashEntriesConfig);
