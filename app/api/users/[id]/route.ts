export const dynamic = "force-dynamic";

import { makeItemHandlers, usersConfig } from '@/lib/rest';

export const { GET, PATCH, DELETE } = makeItemHandlers(usersConfig);
