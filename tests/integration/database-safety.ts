
import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "dotenv";

const TEST_DATABASE_HOST =
    "ep-billowing-silence-b47z1cph-pooler.c-6.us-east-2.aws.neon.tech";

export function getTestDatabaseUrl(): string {
    const envPath = path.resolve(process.cwd(), ".env.test.local");
    const env = parse(readFileSync(envPath, "utf8"));

    const connectionString = env.DATABASE_URL;

    if (!connectionString) {
        throw new Error(
            "DATABASE_URL is missing from .env.test.local",
        );
    }

    const databaseUrl = new URL(connectionString);

    if (databaseUrl.hostname !== TEST_DATABASE_HOST) {
        throw new Error(
            "Integration tests blocked: database host is not the approved test branch.",
        );
    }

    return connectionString;
}
