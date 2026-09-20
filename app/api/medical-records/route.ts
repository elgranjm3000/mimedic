export const dynamic = "force-dynamic";

import { makeCollectionHandlers, medicalRecordsConfig } from '@/lib/rest';

export const { GET, POST } = makeCollectionHandlers(medicalRecordsConfig);
