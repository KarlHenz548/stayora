
import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { bookings } from "@/lib/db/schema/bookings/bookings";
import { bookingRooms } from "@/lib/db/schema/bookings/booking-rooms";
import { user } from "@/lib/db/schema/auth/auth";
import { rooms } from "@/lib/db/schema/rooms/rooms";
import { roomTypes } from "@/lib/db/schema/rooms/room-types";
import { hotels } from "@/lib/db/schema/hotels/hotels";

export async function getAdminBookings() {
    await requireAdmin();

    const rows = await db
        .select({
            id: bookings.id,
            guestName: user.name,
            guestEmail: user.email,
            checkIn: bookings.checkIn,
            checkOut: bookings.checkOut,
            status: bookings.status,
            paymentMethod: bookings.paymentMethod,
            paymentStatus: bookings.paymentStatus,
            totalPrice: bookings.totalPrice,
            createdAt: bookings.createdAt,
            bookingRoomId: bookingRooms.id,
            roomNumber: rooms.roomNumber,
            roomTypeName: roomTypes.name,
            hotelName: hotels.name,
        })
        .from(bookings)
        .innerJoin(user, eq(user.id, bookings.guestId))
        .leftJoin(bookingRooms, eq(bookingRooms.bookingId, bookings.id))
        .leftJoin(rooms, eq(rooms.id, bookingRooms.roomId))
        .leftJoin(roomTypes, eq(roomTypes.id, rooms.roomTypeId))
        .leftJoin(hotels, eq(hotels.id, rooms.hotelId))
        .orderBy(desc(bookings.createdAt));

    const bookingsById = new Map<
        string,
        {
            id: string;
            guestName: string;
            guestEmail: string;
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
            }[];
        }
    >();

    for (const row of rows) {
        let booking = bookingsById.get(row.id);

        if (!booking) {
            booking = {
                id: row.id,
                guestName: row.guestName,
                guestEmail: row.guestEmail,
                checkIn: row.checkIn,
                checkOut: row.checkOut,
                status: row.status,
                paymentMethod: row.paymentMethod,
                paymentStatus: row.paymentStatus,
                totalPrice: row.totalPrice,
                createdAt: row.createdAt,
                rooms: [],
            };

            bookingsById.set(row.id, booking);
        }

        if (row.bookingRoomId && row.roomNumber !== null) {
            booking.rooms.push({
                id: row.bookingRoomId,
                roomNumber: row.roomNumber,
                roomTypeName: row.roomTypeName,
                hotelName: row.hotelName,
            });
        }
    }

    return Array.from(bookingsById.values());
}
