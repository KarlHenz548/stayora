
import {
    foreignKey,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
} from "drizzle-orm/pg-core";
import { hotels } from "../hotels/hotels";
import { roomTypes } from "./room-types";

export const rooms = pgTable(
    "rooms",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        hotelId: uuid("hotel_id")
            .notNull()
            .references(() => hotels.id, { onDelete: "cascade" }),

        roomTypeId: uuid("room_type_id").notNull(),

        roomNumber: text("room_number").notNull(),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        unique("rooms_hotel_id_room_number_unique").on(
            table.hotelId,
            table.roomNumber,
        ),

        foreignKey({
            name: "rooms_hotel_room_type_fk",
            columns: [table.hotelId, table.roomTypeId],
            foreignColumns: [roomTypes.hotelId, roomTypes.id],
        }).onDelete("cascade"),
    ],
);

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
