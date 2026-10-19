
import { z } from "zod";

export const createBookingSchema = z
    .object({
        roomTypeId: z.uuid(),
        checkIn: z.iso.date(),
        checkOut: z.iso.date(),
        guestCount: z.number().int().positive(),
        paymentMethod: z.enum(["pay_at_hotel", "online"]),
    })
    .refine(
        (data) => data.checkOut > data.checkIn,
        {
            message: "Check-out must be after check-in.",
            path: ["checkOut"],
        },
    )
    .refine(
        (data) => {
            const checkIn = new Date(`${data.checkIn}T00:00:00.000Z`);
            const checkOut = new Date(`${data.checkOut}T00:00:00.000Z`);

            const nights =
                (checkOut.getTime() - checkIn.getTime()) /
                (1000 * 60 * 60 * 24);

            return nights <= 30;
        },
        {
            message: "A booking cannot exceed 30 nights.",
            path: ["checkOut"],
        },
    );

export type CreateBookingInput = z.infer<
    typeof createBookingSchema
>;
