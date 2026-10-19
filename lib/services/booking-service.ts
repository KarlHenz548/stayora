
import "server-only";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

import { findAvailableRoom } from "@/lib/dal/booking-availability";
import { getNightlyRates } from "@/lib/dal/booking-rates";

import { bookings } from "@/lib/db/schema/bookings/bookings";
import { bookingRooms } from "@/lib/db/schema/bookings/booking-rooms";
import { bookingRoomNights } from "@/lib/db/schema/bookings/booking-room-nights";

import {
    expireConflictingPendingBookingsInTransaction,
} from "@/lib/services/booking-expiration-service";

import {
    createBookingSchema,

} from "@/lib/validations/booking";

import { formatCents, toCents } from "@/lib/utils/money";



export async function createBooking(input: unknown) {
    const session = await requireAuth();
    const validatedInput = createBookingSchema.parse(input);

    try {
        return await db.transaction(async (tx) => {
            await expireConflictingPendingBookingsInTransaction(tx, {
                roomTypeId: validatedInput.roomTypeId,
                checkIn: validatedInput.checkIn,
                checkOut: validatedInput.checkOut,
            });
            const nightlyRates = await getNightlyRates(
                {
                    roomTypeId: validatedInput.roomTypeId,
                    checkIn: validatedInput.checkIn,
                    checkOut: validatedInput.checkOut,
                },
                tx,
            );

            if (!nightlyRates) {
                throw new Error(
                    "No rates available for the selected dates.",
                );
            }

            const totalCents = nightlyRates.reduce(
                (total, rate) => total + toCents(rate.pricePerNight),
                0,
            );

            if (!Number.isSafeInteger(totalCents) || totalCents <= 0) {
                throw new Error("Invalid booking total.");
            }

            const totalPrice = formatCents(totalCents);

            const expiresAt =
                validatedInput.paymentMethod === "online"
                    ? new Date(Date.now() + 15 * 60 * 1000)
                    : null;


            const roomId = await findAvailableRoom(
                {
                    roomTypeId: validatedInput.roomTypeId,
                    checkIn: validatedInput.checkIn,
                    checkOut: validatedInput.checkOut,
                    guestCount: validatedInput.guestCount,
                },
                tx,
            );

            if (!roomId) {
                throw new Error(
                    "No room is available for the selected dates.",
                );
            }

            const [booking] = await tx
                .insert(bookings)
                .values({
                    guestId: session.user.id,
                    checkIn: validatedInput.checkIn,
                    checkOut: validatedInput.checkOut,
                    paymentMethod: validatedInput.paymentMethod,
                    expiresAt,
                    totalPrice,
                })
                .returning({ id: bookings.id });

            const [bookingRoom] = await tx
                .insert(bookingRooms)
                .values({
                    bookingId: booking.id,
                    roomId,
                    checkIn: validatedInput.checkIn,
                    checkOut: validatedInput.checkOut,
                    pricePerNight: nightlyRates[0].pricePerNight,
                    isActive: true,
                })
                .returning({ id: bookingRooms.id });

            await tx.insert(bookingRoomNights).values(
                nightlyRates.map((rate) => ({
                    bookingRoomId: bookingRoom.id,
                    stayDate: rate.stayDate,
                    pricePerNight: rate.pricePerNight,
                })),
            );

            return {
                bookingId: booking.id,
                totalPrice,
            };
        });
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23P01"
        ) {
            throw new Error(
                "This room was just booked. Please select different dates or try again.",
            );
        }

        throw error;
    }
}
