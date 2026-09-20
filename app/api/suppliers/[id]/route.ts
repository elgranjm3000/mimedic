export const dynamic = "force-dynamic";

import { makeItemHandlers, suppliersConfig } from '@/lib/rest';

export const { GET, PATCH, DELETE } = makeItemHandlers(suppliersConfig);
