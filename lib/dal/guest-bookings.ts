
import "server-only";

import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { bookings } from "@/lib/db/schema/bookings/bookings";
import { bookingRooms } from "@/lib/db/schema/bookings/booking-rooms";
import { bookingRoomNights } from "@/lib/db/schema/bookings/booking-room-nights";
import { rooms } from "@/lib/db/schema/rooms/rooms";
import { roomTypes } from "@/lib/db/schema/rooms/room-types";
import { hotels } from "@/lib/db/schema/hotels/hotels";

export async function getGuestBookings() {
    const session = await requireAuth();

    const rows = await db
        .select({
            bookingId: bookings.id,
            checkIn: bookings.checkIn,
            checkOut: bookings.checkOut,
            status: bookings.status,
            paymentMethod: bookings.paymentMethod,
            paymentStatus: bookings.paymentStatus,
            totalPrice: bookings.totalPrice,
            createdAt: bookings.createdAt,
            bookingRoomId: bookingRooms.id,
            roomId: rooms.id,
            roomNumber: rooms.roomNumber,
            roomTypeName: roomTypes.name,
            hotelName: hotels.name,
            hotelCity: hotels.city,
        })
        .from(bookings)
        .leftJoin(
            bookingRooms,
            eq(bookingRooms.bookingId, bookings.id),
        )
        .leftJoin(rooms, eq(rooms.id, bookingRooms.roomId))
        .leftJoin(roomTypes, eq(roomTypes.id, rooms.roomTypeId))
        .leftJoin(hotels, eq(hotels.id, rooms.hotelId))
        .where(eq(bookings.guestId, session.user.id))
        .orderBy(desc(bookings.createdAt));

    const bookingsById = new Map<
        string,
        {
            id: string;
            checkIn: string;
            checkOut: string;
            status: (typeof bookings.$inferSelect)["status"];
            paymentMethod: (typeof bookings.$inferSelect)["paymentMethod"];
            paymentStatus: (typeof bookings.$inferSelect)["paymentStatus"];
            totalPrice: string;
            createdAt: Date;
            rooms: {
                id: string;
                roomNumber: string;
                roomTypeName: string | null;
                hotelName: string | null;
                hotelCity: string | null;
            }[];
        }
    >();

    for (const row of rows) {
        let booking = bookingsById.get(row.bookingId);

        if (!booking) {
            booking = {
                id: row.bookingId,
                checkIn: row.checkIn,
                checkOut: row.checkOut,
                status: row.status,
                paymentMethod: row.paymentMethod,
                paymentStatus: row.paymentStatus,
                totalPrice: row.totalPrice,
                createdAt: row.createdAt,
                rooms: [],
            };

            bookingsById.set(row.bookingId, booking);
        }

        if (row.bookingRoomId && row.roomId) {
            booking.rooms.push({
                id: row.roomId,
                roomNumber: row.roomNumber!,
                roomTypeName: row.roomTypeName,
                hotelName: row.hotelName,
                hotelCity: row.hotelCity,
            });
        }
    }

    return Array.from(bookingsById.values());
}

export async function getGuestBookingById(bookingId: string) {
    const session = await requireAuth();

    const rows = await db
        .select({
            bookingId: bookings.id,
            checkIn: bookings.checkIn,
            checkOut: bookings.checkOut,
            status: bookings.status,
            paymentMethod: bookings.paymentMethod,
            paymentStatus: bookings.paymentStatus,
            totalPrice: bookings.totalPrice,
            createdAt: bookings.createdAt,
            bookingRoomId: bookingRooms.id,
            roomId: rooms.id,
            roomNumber: rooms.roomNumber,
            roomTypeName: roomTypes.name,
            hotelName: hotels.name,
            hotelCity: hotels.city,
        })
        .from(bookings)
        .leftJoin(
            bookingRooms,
            eq(bookingRooms.bookingId, bookings.id),
        )
        .leftJoin(rooms, eq(rooms.id, bookingRooms.roomId))
        .leftJoin(roomTypes, eq(roomTypes.id, rooms.roomTypeId))
        .leftJoin(hotels, eq(hotels.id, rooms.hotelId))
        .where(
            and(
                eq(bookings.id, bookingId),
                eq(bookings.guestId, session.user.id),
            ),
        );

    if (rows.length === 0) {
        return null;
    }

    const bookingRoomIds = [
        ...new Set(
            rows.flatMap((row) =>
                row.bookingRoomId ? [row.bookingRoomId] : [],
            ),
        ),
    ];

    const nightlyRows =
        bookingRoomIds.length > 0
            ? await db
                .select({
                    bookingRoomId: bookingRoomNights.bookingRoomId,
                    stayDate: bookingRoomNights.stayDate,
                    pricePerNight: bookingRoomNights.pricePerNight,
                })
                .from(bookingRoomNights)
                .where(
                    inArray(
                        bookingRoomNights.bookingRoomId,
                        bookingRoomIds,
                    ),
                )
                .orderBy(asc(bookingRoomNights.stayDate))
            : [];

    const nightlyRatesByRoom = new Map<
        string,
        { stayDate: string; pricePerNight: string }[]
    >();

    for (const night of nightlyRows) {
        const existing =
            nightlyRatesByRoom.get(night.bookingRoomId) ?? [];

        existing.push({
            stayDate: night.stayDate,
            pricePerNight: night.pricePerNight,
        });

        nightlyRatesByRoom.set(night.bookingRoomId, existing);
    }

    const first = rows[0];

    return {
        id: first.bookingId,
        checkIn: first.checkIn,
        checkOut: first.checkOut,
        status: first.status,
        paymentMethod: first.paymentMethod,
        paymentStatus: first.paymentStatus,
        totalPrice: first.totalPrice,
        createdAt: first.createdAt,
        rooms: rows
            .filter(
                (row) => row.bookingRoomId && row.roomId && row.roomNumber !== null,
            )
            .map((row) => ({
                id: row.roomId!,
                roomNumber: row.roomNumber!,
                roomTypeName: row.roomTypeName,
                hotelName: row.hotelName,
                hotelCity: row.hotelCity,
                nightlyRates: nightlyRatesByRoom.get(row.bookingRoomId!) ?? [],
            })),
    };
}
