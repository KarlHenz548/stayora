import { z } from "zod";



// sign up validation

export const signUpSchema = z
    .object({

        name: z
            .string()
            .trim()
            .min(2, "Name must be at least 2 characters.")
            .regex(
                /^[\p{L}\p{M}\s'-]+$/u,
                "Name can only contain letters, spaces, hyphens, and apostrophes.",
            ),

        email: z.email("Please enter a valid email address."),
        password: z.string().min(8, "Password must be at least 8 characters."),
        confirmPassword: z.string().min(1, "Please confirm your password."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });


// sign in validation

export const signInSchema = z.object({
    email: z.email("Please enter a valid email address."),
    password: z.string().min(1, "Please enter your password."),
});
