export const dynamic = "force-dynamic";

import { invoicesConfig, makeItemHandlers } from '@/lib/rest';

export const { GET, PATCH, DELETE } = makeItemHandlers(invoicesConfig);
