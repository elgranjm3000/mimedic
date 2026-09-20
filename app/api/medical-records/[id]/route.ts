export const dynamic = "force-dynamic";

import { makeItemHandlers, medicalRecordsConfig } from '@/lib/rest';

export const { GET, PATCH, DELETE } = makeItemHandlers(medicalRecordsConfig);
