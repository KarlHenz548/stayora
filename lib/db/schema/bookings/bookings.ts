import {
    check,
    date,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { user } from "../auth/auth";

export const bookingStatusEnum = pgEnum("booking_status", [
    "pending",
    "confirmed",
    "cancelled",
    "completed",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
    "online",
    "pay_at_hotel",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
    "pending",
    "paid",
    "failed",
    "refunded",
]);


export const bookings = pgTable("bookings", {
    id: uuid("id").primaryKey().defaultRandom(),

    guestId: text("guest_id")
        .notNull()
        .references(() => user.id, { onDelete: "restrict" }),

    checkIn: date("check_in", { mode: "string" }).notNull(),
    checkOut: date("check_out", { mode: "string" }).notNull(),

    status: bookingStatusEnum("status")
        .default("pending")
        .notNull(),

    paymentMethod: paymentMethodEnum("payment_method").notNull(),


    paymentStatus: paymentStatusEnum("payment_status")
        .default("pending")
        .notNull(),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
    }),

    totalPrice: numeric("total_price", {
        precision: 12,
        scale: 2,
    }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),


}, (table) => [
    check(
        "bookings_valid_date_range",
        sql`${table.checkOut} > ${table.checkIn}`,
    ),
    check(
        "bookings_positive_total_price",
        sql`${table.totalPrice} > 0`,
    ),
]);



export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
