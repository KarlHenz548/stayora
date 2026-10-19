
import "server-only";

import {
    and,
    eq,
    gt,
    gte,
    inArray,
    lt,
    ne,
    notExists,
    or,
} from "drizzle-orm";

import { bookings } from "@/lib/db/schema/bookings/bookings";

import { db } from "@/lib/db";
import { bookingRooms } from "@/lib/db/schema/bookings/booking-rooms";
import { hotels } from "@/lib/db/schema/hotels/hotels";
import { rooms } from "@/lib/db/schema/rooms/rooms";
import { roomTypes } from "@/lib/db/schema/rooms/room-types";
import type { CreateBookingInput } from "@/lib/validations/booking";

import type { DbTransaction } from "@/lib/db";


type AvailabilityInput = Pick<
    CreateBookingInput,
    "roomTypeId" | "checkIn" | "checkOut" | "guestCount"
>;


export async function findAvailableRoom(
    input: AvailabilityInput,
    executor: typeof db | DbTransaction = db,
): Promise<string | null> {
    const availableRooms = await executor
        .select({
            roomId: rooms.id,
        })
        .from(rooms)
        .innerJoin(
            roomTypes,
            eq(rooms.roomTypeId, roomTypes.id),
        )
        .innerJoin(
            hotels,
            eq(roomTypes.hotelId, hotels.id),
        )
        .where(
            and(
                eq(roomTypes.id, input.roomTypeId),
                gte(roomTypes.capacity, input.guestCount),
                eq(hotels.status, "published"),
                notExists(
                    executor
                        .select({ id: bookingRooms.id })
                        .from(bookingRooms)
                        .where(
                            and(
                                eq(bookingRooms.roomId, rooms.id),
                                eq(bookingRooms.isActive, true),
                                lt(
                                    bookingRooms.checkIn,
                                    input.checkOut,
                                ),
                                gt(
                                    bookingRooms.checkOut,
                                    input.checkIn,


                                ),


                            ),
                        ),

                ),

            ),


        )
        .limit(1);

    return availableRooms[0]?.roomId ?? null;
}

export async function getUnavailableRoomDates(
    input: {
        roomTypeId: string;
        guestCount: number;
        startDate: string;
        endDate: string;
    },
) {
    if (input.endDate <= input.startDate) {
        return [];
    }

    const availableRoomRows = await db
        .select({ roomId: rooms.id })
        .from(rooms)
        .innerJoin(roomTypes, eq(rooms.roomTypeId, roomTypes.id))
        .innerJoin(hotels, eq(roomTypes.hotelId, hotels.id))
        .where(
            and(
                eq(roomTypes.id, input.roomTypeId),
                gte(roomTypes.capacity, input.guestCount),
                eq(hotels.status, "published"),
            ),
        );

    const roomIds = availableRoomRows.map((room) => room.roomId);

    if (roomIds.length === 0) {
        const dates: string[] = [];
        const current = new Date(`${input.startDate}T00:00:00Z`);
        const end = new Date(`${input.endDate}T00:00:00Z`);

        while (current < end) {
            dates.push(current.toISOString().slice(0, 10));
            current.setUTCDate(current.getUTCDate() + 1);
        }

        return dates;
    }

    const now = new Date();

    const activeBookings = await db
        .select({
            roomId: bookingRooms.roomId,
            checkIn: bookingRooms.checkIn,
            checkOut: bookingRooms.checkOut,
        })
        .from(bookingRooms)
        .innerJoin(bookings, eq(bookingRooms.bookingId, bookings.id))
        .where(
            and(
                eq(bookingRooms.isActive, true),
                inArray(bookingRooms.roomId, roomIds),
                lt(bookingRooms.checkIn, input.endDate),
                gt(bookingRooms.checkOut, input.startDate),
                ne(bookings.status, "cancelled"),
                or(
                    ne(bookings.status, "pending"),
                    ne(bookings.paymentMethod, "online"),
                    ne(bookings.paymentStatus, "pending"),
                    gt(bookings.expiresAt, now),
                ),
            ),
        );

    const unavailableDates: string[] = [];
    const current = new Date(`${input.startDate}T00:00:00Z`);
    const end = new Date(`${input.endDate}T00:00:00Z`);

    while (current < end) {
        const date = current.toISOString().slice(0, 10);
        const next = new Date(current);
        next.setUTCDate(next.getUTCDate() + 1);
        const nextDate = next.toISOString().slice(0, 10);

        const occupiedRoomIds = new Set(
            activeBookings
                .filter(
                    (booking) =>
                        booking.checkIn < nextDate &&
                        booking.checkOut > date,
                )
                .map((booking) => booking.roomId),
        );

        if (occupiedRoomIds.size >= roomIds.length) {
            unavailableDates.push(date);
        }

        current.setUTCDate(current.getUTCDate() + 1);
    }

    return unavailableDates;
}