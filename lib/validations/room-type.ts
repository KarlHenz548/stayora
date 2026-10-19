
import { z } from "zod";

export const roomTypeSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Room type name must be at least 2 characters.")
        .max(120, "Room type name must be 120 characters or fewer."),
    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters.")
        .max(1000, "Description must be 1000 characters or fewer."),
    capacity: z.coerce
        .number()
        .int("Capacity must be a whole number.")
        .min(1, "Capacity must be at least 1.")
        .max(20, "Capacity cannot exceed 20 guests."),
    bedConfiguration: z
        .string()
        .trim()
        .min(2, "Bed configuration must be at least 2 characters.")
        .max(120, "Bed configuration must be 120 characters or fewer."),
});

export type RoomTypeInput = z.infer<typeof roomTypeSchema>;
