
import { z } from "zod";

function getPhilippinesDateString() {
    const parts = new Intl.DateTimeFormat("en", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts.map((part) => [part.type, part.value]),
    );

    return `${values.year}-${values.month}-${values.day}`;
}

export const hotelSearchSchema = z
    .object({
        destination: z.string().trim().max(100).optional(),
        checkIn: z.union([z.literal(""), z.iso.date()]).optional(),
        checkOut: z.union([z.literal(""), z.iso.date()]).optional(),
        guestCount: z.coerce.number().int().min(1).max(20).default(1),
    })
    .superRefine((data, context) => {
        const hasCheckIn = Boolean(data.checkIn);
        const hasCheckOut = Boolean(data.checkOut);

        if (hasCheckIn !== hasCheckOut) {
            context.addIssue({
                code: "custom",
                message: "Please select both check-in and check-out dates.",
                path: [hasCheckIn ? "checkOut" : "checkIn"],
            });
        }

        if (hasCheckIn && hasCheckOut) {
            if (data.checkOut! <= data.checkIn!) {
                context.addIssue({
                    code: "custom",
                    message: "Check-out must be after check-in.",
                    path: ["checkOut"],
                });
            }
        }

        if (hasCheckIn && data.checkIn! < getPhilippinesDateString()) {
            context.addIssue({
                code: "custom",
                message: "Check-in cannot be in the past.",
                path: ["checkIn"],
            });
        }
    });

export type HotelSearchInput = z.infer<typeof hotelSearchSchema>;
