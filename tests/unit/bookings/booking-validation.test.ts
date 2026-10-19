import { describe, expect, it } from "vitest";
import { createBookingSchema } from "../../../lib/validations/booking";
const validBooking = {
    roomTypeId: "550e8400-e29b-41d4-a716-446655440000",
    checkIn: "2026-11-01",
    checkOut: "2026-11-05",
    guestCount: 2,
    paymentMethod: "online" as const,
};

describe("createBookingSchema", () => {
    it("accepts a valid booking", () => {
        expect(
            createBookingSchema.safeParse(validBooking).success,
        ).toBe(true);
    });


    it("rejects an invalid room type UUID", () => {
        const result = createBookingSchema.safeParse({
            ...validBooking,
            roomTypeId: "not-a-valid-uuid",
        });

        expect(result.success).toBe(false);
    });


    it("rejects check-out on the same day as check-in", () => {
        const result = createBookingSchema.safeParse({
            ...validBooking,
            checkOut: validBooking.checkIn,
        });

        expect(result.success).toBe(false);
    });

    it("rejects check-out before check-in", () => {
        const result = createBookingSchema.safeParse({
            ...validBooking,
            checkOut: "2026-10-31",
        });

        expect(result.success).toBe(false);
    });

    it("accepts a stay of exactly 30 nights", () => {
        const result = createBookingSchema.safeParse({
            ...validBooking,
            checkIn: "2026-11-01",
            checkOut: "2026-12-01",
        });

        expect(result.success).toBe(true);
    });

    it("rejects a stay longer than 30 nights", () => {
        const result = createBookingSchema.safeParse({
            ...validBooking,
            checkIn: "2026-11-01",
            checkOut: "2026-12-02",
        });

        expect(result.success).toBe(false);
    });

    it("rejects a zero guest count", () => {
        const result = createBookingSchema.safeParse({
            ...validBooking,
            guestCount: 0,
        });

        expect(result.success).toBe(false);
    });

    it("rejects a non-integer guest count", () => {
        const result = createBookingSchema.safeParse({
            ...validBooking,
            guestCount: 1.5,
        });

        expect(result.success).toBe(false);
    });

    it("rejects an invalid payment method", () => {
        const result = createBookingSchema.safeParse({
            ...validBooking,
            paymentMethod: "cash",
        });

        expect(result.success).toBe(false);
    });

    it("rejects an invalid calendar date", () => {
        const result = createBookingSchema.safeParse({
            ...validBooking,
            checkIn: "2026-02-30",
        });

        expect(result.success).toBe(false);
    });

    it("rejects a date with an invalid format", () => {
        const result = createBookingSchema.safeParse({
            ...validBooking,
            checkIn: "11/01/2026",
        });

        expect(result.success).toBe(false);
    });

});
