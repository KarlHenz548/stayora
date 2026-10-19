
import { sql } from "drizzle-orm";
import {
    check,
    date,
    numeric,
    pgTable,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { roomTypes } from "./room-types";

export const roomRates = pgTable(
    "room_rates",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        roomTypeId: uuid("room_type_id")
            .notNull()
            .references(() => roomTypes.id, { onDelete: "cascade" }),

        startDate: date("start_date", { mode: "string" }).notNull(),
        endDate: date("end_date", { mode: "string" }).notNull(),

        pricePerNight: numeric("price_per_night", {
            precision: 10,
            scale: 2,
        }).notNull(),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        check(
            "room_rates_valid_date_range",
            sql`${table.endDate} > ${table.startDate}`,
        ),
        check(
            "room_rates_positive_price",
            sql`${table.pricePerNight} > 0`,
        ),
    ],
);

export type RoomRate = typeof roomRates.$inferSelect;
export type NewRoomRate = typeof roomRates.$inferInsert;
