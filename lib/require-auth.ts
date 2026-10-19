
import { getCurrentSession } from "@/lib/auth-session";

export async function requireAuth() {
    const session = await getCurrentSession();

    if (!session) {
        throw new Error("Unauthorized: Please sign in to continue.");
    }

    return session;
}
