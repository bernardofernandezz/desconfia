import { createDb } from "@desconfia/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
