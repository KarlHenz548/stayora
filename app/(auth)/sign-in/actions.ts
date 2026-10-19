"use server";

import { auth } from "@/lib/auth";
import { signInSchema } from "@/lib/validations/auth";

export type SignInState = {
    error: string | null;
    success: boolean;
    destination: "/admin" | null;
};

export async function signInAction(
    _previousState: SignInState,
    formData: FormData,
): Promise<SignInState> {
    const result = signInSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!result.success) {
        return {
            error: result.error.issues[0].message,
            success: false,
            destination: null,
        };
    }

    const { email, password } = result.data;

    try {
        const response = await auth.api.signInEmail({
            body: {
                email,
                password,
            },
        });

        return {
            error: null,
            success: true,
            destination:
                response.user.role === "admin" ? "/admin" : null,
        };
    } catch {
        return {
            error: "Invalid email or password. Please try again.",
            success: false,
            destination: null,
        };
    }
}