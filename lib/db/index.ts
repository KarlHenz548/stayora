

import * as schema from "./schema";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";



const databaseUrl = process.env.DATABASE_URL;



if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
    connectionString: databaseUrl,
});

export const db = drizzle({ client: pool, schema });


export type DbTransaction = Parameters<
    Parameters<typeof db.transaction>[0]
>[0];
