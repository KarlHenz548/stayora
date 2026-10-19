import {
    boolean,
    check,
    date,
    numeric,
    pgTable,
    timestamp,
    unique,
    uuid,
} from "drizzle-orm/pg-core";


import { sql } from "drizzle-orm";


import { bookings } from "./bookings";
import { rooms } from "../rooms/rooms";

export const bookingRooms = pgTable(
    "booking_rooms",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        bookingId: uuid("booking_id")
            .notNull()
            .references(() => bookings.id, { onDelete: "cascade" }),

        roomId: uuid("room_id")
            .notNull()
            .references(() => rooms.id, { onDelete: "restrict" }),
        isActive: boolean("is_active").default(true).notNull(),

        checkIn: date("check_in", { mode: "string" }).notNull(),
        checkOut: date("check_out", { mode: "string" }).notNull(),

        pricePerNight: numeric("price_per_night", {
            precision: 10,
            scale: 2,
        }).notNull(),

        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        unique("booking_rooms_booking_room_unique").on(
            table.bookingId,
            table.roomId,
        ),
        check(
            "booking_rooms_valid_date_range",
            sql`${table.checkOut} > ${table.checkIn}`,
        ),
        check(
            "booking_rooms_positive_price",
            sql`${table.pricePerNight} > 0`,
        ),
    ],
);

export type BookingRoom = typeof bookingRooms.$inferSelect;
export type NewBookingRoom = typeof bookingRooms.$inferInsert;
