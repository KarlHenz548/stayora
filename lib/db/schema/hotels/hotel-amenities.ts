
import {
    pgTable,
    primaryKey,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { amenities } from "./amenities";
import { hotels } from "./hotels";

export const hotelAmenities = pgTable(
    "hotel_amenities",
    {
        hotelId: uuid("hotel_id")
            .notNull()
            .references(() => hotels.id, { onDelete: "cascade" }),

        amenityId: uuid("amenity_id")
            .notNull()
            .references(() => amenities.id, { onDelete: "cascade" }),

        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        primaryKey({
            name: "hotel_amenities_pk",
            columns: [table.hotelId, table.amenityId],
        }),
    ],
);

export type HotelAmenity = typeof hotelAmenities.$inferSelect;
export type NewHotelAmenity = typeof hotelAmenities.$inferInsert;
