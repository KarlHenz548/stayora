"use server";

import { auth } from "@/lib/auth";
import { signUpSchema } from "@/lib/validations/auth";

export type SignUpState = {
  error: string | null;
  success: boolean;
};

export async function signUpAction(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const result = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return {
      error: result.error.issues[0].message,
      success: false,
    };
  }

  const { name, email, password } = result.data;

  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    return {
      error: null,
      success: true,
    };
  } catch {
    return {
      error: "Unable to create your account. Please check your details and try again.",
      success: false,
    };
  }
}