export const dynamic = "force-dynamic";

import { makeCollectionHandlers, prescriptionsConfig } from '@/lib/rest';

export const { GET, POST } = makeCollectionHandlers(prescriptionsConfig);
