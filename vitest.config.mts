import { defineConfig } from "vitest/config";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(import.meta.dirname, ".env.test.local") });

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "."),
        },
    },
    test: {
        environment: "node",
    },
});