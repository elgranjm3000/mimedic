export const dynamic = "force-dynamic";

import { makeItemHandlers, prescriptionsConfig } from '@/lib/rest';

export const { GET, PATCH, DELETE } = makeItemHandlers(prescriptionsConfig);
