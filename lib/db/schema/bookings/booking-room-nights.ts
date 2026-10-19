
import {
    check,
    date,
    numeric,
    pgTable,
    timestamp,
    unique,
    uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { bookingRooms } from "./booking-rooms";

export const bookingRoomNights = pgTable(
    "booking_room_nights",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        bookingRoomId: uuid("booking_room_id")
            .notNull()
            .references(() => bookingRooms.id, { onDelete: "cascade" }),
        stayDate: date("stay_date", { mode: "string" }).notNull(),
        pricePerNight: numeric("price_per_night", {
            precision: 10,
            scale: 2,
        }).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        unique("booking_room_nights_room_date_unique").on(
            table.bookingRoomId,
            table.stayDate,
        ),
        check(
            "booking_room_nights_positive_price",
            sql`${table.pricePerNight} > 0`,
        ),
    ],
);

export type BookingRoomNight = typeof bookingRoomNights.$inferSelect;
export type NewBookingRoomNight = typeof bookingRoomNights.$inferInsert;
