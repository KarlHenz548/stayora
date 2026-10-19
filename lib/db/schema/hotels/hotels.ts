
import {
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const hotelStatusEnum = pgEnum("hotel_status", [
    "draft",
    "published",
    "archived",
]);

export const hotels = pgTable("hotels", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),

    address: text("address").notNull(),
    city: text("city").notNull(),
    country: text("country").notNull(),

    status: hotelStatusEnum("status").default("draft").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export type Hotel = typeof hotels.$inferSelect;
export type NewHotel = typeof hotels.$inferInsert;
