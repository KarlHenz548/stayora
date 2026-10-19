import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { bookings } from "@/lib/db/schema/bookings/bookings";
import { bookingRooms } from "@/lib/db/schema/bookings/booking-rooms";

const CANCELLABLE_STATUSES = ["pending", "confirmed"] as const;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const PHILIPPINE_UTC_OFFSET = "+08:00";

export async function cancelBooking(bookingId: string) {
    const session = await requireAuth();

    return db.transaction(async (tx) => {
        const [booking] = await tx
            .select({
                id: bookings.id,
                guestId: bookings.guestId,
                checkIn: bookings.checkIn,
                status: bookings.status,
            })
            .from(bookings)
            .where(
                and(
                    eq(bookings.id, bookingId),
                    eq(bookings.guestId, session.user.id),
                ),
            )
            .limit(1)
            .for("update");

        if (!booking) {
            throw new Error("Booking not found or you do not have permission to cancel it.");
        }

        if (
            !CANCELLABLE_STATUSES.includes(
                booking.status as (typeof CANCELLABLE_STATUSES)[number],
            )
        ) {
            throw new Error("This booking can no longer be cancelled.");
        }

        const checkInStart = new Date(
            `${booking.checkIn}T00:00:00${PHILIPPINE_UTC_OFFSET}`,
        );

        const cancellationCutoff = checkInStart.getTime() - ONE_DAY_MS;

        if (Date.now() > cancellationCutoff) {
            throw new Error("Bookings can only be cancelled at least 24 hours before check-in.");
        }

        const [cancelledBooking] = await tx
            .update(bookings)
            .set({ status: "cancelled" })
            .where(
                and(
                    eq(bookings.id, booking.id),
                    eq(bookings.guestId, session.user.id),
                    inArray(bookings.status, [...CANCELLABLE_STATUSES]),
                ),
            )
            .returning({ id: bookings.id });

        if (!cancelledBooking) {
            throw new Error("This booking can no longer be cancelled.");
        }

        await tx
            .update(bookingRooms)
            .set({ isActive: false })
            .where(
                and(
                    eq(bookingRooms.bookingId, cancelledBooking.id),
                    eq(bookingRooms.isActive, true),
                ),
            );

        return { bookingId: cancelledBooking.id };
    });
}