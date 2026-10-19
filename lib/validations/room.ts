import { z } from "zod";

export const roomSchema = z.object({
    roomNumber: z
        .string()
        .trim()
        .min(1, "Room number is required.")
        .max(30, "Room number must be 30 characters or fewer.")
        .regex(
            /^[a-zA-Z0-9-]+$/,
            "Use only letters, numbers, and hyphens.",
        ),
    roomTypeId: z.uuid("Please select a valid room type."),
});

export type RoomInput = z.infer<typeof roomSchema>;