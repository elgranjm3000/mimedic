export const dynamic = "force-dynamic";

import { makeCollectionHandlers, patientsConfig } from '@/lib/rest';

export const { GET, POST } = makeCollectionHandlers(patientsConfig);
