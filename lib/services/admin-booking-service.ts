
import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema/bookings/bookings";
import { bookingRooms } from "@/lib/db/schema/bookings/booking-rooms";
import { requireAdmin } from "@/lib/require-admin";

const CANCELLABLE_STATUSES = ["pending", "confirmed"] as const;

export async function adminCancelBooking(bookingId: string) {
    await requireAdmin();

    return db.transaction(async (tx) => {
        const [booking] = await tx
            .select({
                id: bookings.id,
                status: bookings.status,
            })
            .from(bookings)
            .where(eq(bookings.id, bookingId))
            .limit(1)
            .for("update");

        if (!booking) {
            throw new Error("Booking not found.");
        }

        if (
            !CANCELLABLE_STATUSES.includes(
                booking.status as (typeof CANCELLABLE_STATUSES)[number],
            )
        ) {
            throw new Error("This booking can no longer be cancelled.");
        }

        const [cancelledBooking] = await tx
            .update(bookings)
            .set({ status: "cancelled" })
            .where(
                and(
                    eq(bookings.id, booking.id),
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
