
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-session";

export async function requireAdmin() {
    const session = await getCurrentSession();

    if (!session) {
        redirect("/sign-in");
    }

    if (session.user.role !== "admin") {
        redirect("/");
    }

    return session;
}
