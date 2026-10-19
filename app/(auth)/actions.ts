
"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function signOutAction() {
    try {
        await auth.api.signOut({
            headers: await headers(),
        });

        return { success: true };
    } catch {
        return { success: false };
    }
}
