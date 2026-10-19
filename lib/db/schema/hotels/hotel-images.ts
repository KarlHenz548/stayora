
import {
    boolean,
    integer,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { hotels } from "./hotels";

export const hotelImages = pgTable("hotel_images", {
    id: uuid("id").primaryKey().defaultRandom(),

    hotelId: uuid("hotel_id")
        .notNull()
        .references(() => hotels.id, { onDelete: "cascade" }),

    imageUrl: text("image_url").notNull(),
    altText: text("alt_text").notNull(),

    isPrimary: boolean("is_primary").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
},
    (table) => [
        uniqueIndex("hotel_images_one_primary_per_hotel")
            .on(table.hotelId)
            .where(sql`$DIL0 = true`),
    ],
);

export type HotelImage = typeof hotelImages.$inferSelect;
export type NewHotelImage = typeof hotelImages.$inferInsert;
