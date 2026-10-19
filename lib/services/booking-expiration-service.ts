
import "server-only";

import {
    and,
    asc,
    eq,
    exists,
    gt,
    inArray,
    lt,
    lte,
} from "drizzle-orm";

import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema/bookings/bookings";
import { bookingRooms } from "@/lib/db/schema/bookings/booking-rooms";

import { rooms } from "@/lib/db/schema/rooms/rooms";
import type { CreateBookingInput } from "@/lib/validations/booking";
import type { DbTransaction } from "@/lib/db";


export async function expirePendingBookingsInTransaction(
    tx: DbTransaction,
) {
    const now = new Date();

    const expiredBookings = await tx
        .select({ id: bookings.id })
        .from(bookings)
        .where(
            and(
                eq(bookings.status, "pending"),
                eq(bookings.paymentMethod, "online"),
                eq(bookings.paymentStatus, "pending"),
                lte(bookings.expiresAt, now),
            ),
        )
        .orderBy(asc(bookings.expiresAt))
        .limit(100)
        .for("update", { skipLocked: true });

    if (expiredBookings.length === 0) {
        return { expiredCount: 0 };
    }

    const expiredIds = expiredBookings.map(
        (booking) => booking.id,
    );

    const cancelledBookings = await tx
        .update(bookings)
        .set({ status: "cancelled" })
        .where(
            and(
                inArray(bookings.id, expiredIds),
                eq(bookings.status, "pending"),
                eq(bookings.paymentMethod, "online"),
                eq(bookings.paymentStatus, "pending"),
                lte(bookings.expiresAt, now),
            ),
        )
        .returning({ id: bookings.id });

    const cancelledIds = cancelledBookings.map(
        (booking) => booking.id,
    );

    if (cancelledIds.length > 0) {
        await tx
            .update(bookingRooms)
            .set({ isActive: false })
            .where(
                and(
                    inArray(bookingRooms.bookingId, cancelledIds),
                    eq(bookingRooms.isActive, true),
                ),
            );
    }

    return { expiredCount: cancelledIds.length };
}

export async function expirePendingBookings() {
    return db.transaction(async (tx) => {
        return expirePendingBookingsInTransaction(tx);
    });
}


type ConflictingBookingInput = Pick<
    CreateBookingInput,
    "roomTypeId" | "checkIn" | "checkOut"
>;

export async function expireConflictingPendingBookingsInTransaction(
    tx: DbTransaction,
    input: ConflictingBookingInput,
) {
    const now = new Date();

    const expiredBookings = await tx
        .select({ id: bookings.id })
        .from(bookings)
        .where(
            and(
                eq(bookings.status, "pending"),
                eq(bookings.paymentMethod, "online"),
                eq(bookings.paymentStatus, "pending"),
                lte(bookings.expiresAt, now),
                exists(
                    tx
                        .select({ id: bookingRooms.id })
                        .from(bookingRooms)
                        .innerJoin(
                            rooms,
                            eq(bookingRooms.roomId, rooms.id),
                        )
                        .where(
                            and(
                                eq(bookingRooms.bookingId, bookings.id),
                                eq(bookingRooms.isActive, true),
                                eq(rooms.roomTypeId, input.roomTypeId),
                                lt(bookingRooms.checkIn, input.checkOut),
                                gt(bookingRooms.checkOut, input.checkIn),
                            ),
                        ),
                ),
            ),
        )
        .orderBy(asc(bookings.expiresAt))
        .for("update");

    if (expiredBookings.length === 0) {
        return { expiredCount: 0 };
    }

    const expiredIds = expiredBookings.map(
        (booking) => booking.id,
    );

    const cancelledBookings = await tx
        .update(bookings)
        .set({ status: "cancelled" })
        .where(
            and(
                inArray(bookings.id, expiredIds),
                eq(bookings.status, "pending"),
                eq(bookings.paymentMethod, "online"),
                eq(bookings.paymentStatus, "pending"),
                lte(bookings.expiresAt, now),
            ),
        )
        .returning({ id: bookings.id });

    const cancelledIds = cancelledBookings.map(
        (booking) => booking.id,
    );

    if (cancelledIds.length > 0) {
        await tx
            .update(bookingRooms)
            .set({ isActive: false })
            .where(
                and(
                    inArray(bookingRooms.bookingId, cancelledIds),
                    eq(bookingRooms.isActive, true),
                ),
            );
    }

    return { expiredCount: cancelledIds.length };
}
