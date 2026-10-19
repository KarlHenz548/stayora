
import { z } from "zod";

export const hotelSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Hotel name must be at least 2 characters.")
        .max(120, "Hotel name must be 120 characters or fewer."),

    slug: z
        .string()
        .trim()
        .min(2, "URL slug must be at least 2 characters.")
        .max(120, "URL slug must be 120 characters or fewer.")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Use lowercase letters, numbers, and single hyphens only.",
        ),

    description: z
        .string()
        .trim()
        .min(20, "Description must be at least 20 characters.")
        .max(2000, "Description must be 2000 characters or fewer."),

    address: z
        .string()
        .trim()
        .min(5, "Address must be at least 5 characters.")
        .max(250, "Address must be 250 characters or fewer."),

    city: z
        .string()
        .trim()
        .min(2, "City must be at least 2 characters.")
        .max(100, "City must be 100 characters or fewer."),

    country: z
        .string()
        .trim()
        .min(2, "Country must be at least 2 characters.")
        .max(100, "Country must be 100 characters or fewer."),
});

export type HotelInput = z.infer<typeof hotelSchema>;
