import { z } from "zod";

export const roomRateSchema = z
    .object({
        roomTypeId: z.uuid("Please select a valid room type."),
        startDate: z.iso.date("Please enter a valid start date."),
        endDate: z.iso.date("Please enter a valid end date."),
        pricePerNight: z.coerce
            .number()
            .finite("Price must be a valid number.")
            .positive("Price must be greater than zero.")
            .max(99999999.99, "Price is too high."),
    })
    .refine((data) => data.endDate > data.startDate, {
        path: ["endDate"],
        message: "End date must be after the start date.",
    });

export type RoomRateInput = z.infer<typeof roomRateSchema>;