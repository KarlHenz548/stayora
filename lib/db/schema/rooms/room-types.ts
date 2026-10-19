
import {
    integer,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
} from "drizzle-orm/pg-core";
import { hotels } from "../hotels/hotels";

export const roomTypes = pgTable("room_types", {
    id: uuid("id").primaryKey().defaultRandom(),

    hotelId: uuid("hotel_id")
        .notNull()
        .references(() => hotels.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    description: text("description").notNull(),

    capacity: integer("capacity").notNull(),
    bedConfiguration: text("bed_configuration").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
},
    (table) => [
        unique("room_types_hotel_id_id_unique").on(
            table.hotelId,
            table.id,
        ),
    ]);


export type RoomType = typeof roomTypes.$inferSelect;
export type NewRoomType = typeof roomTypes.$inferInsert;
