
import { beforeEach, expect, it, vi } from "vitest";
import { findAvailableRoom } from "@/lib/dal/booking-availability";
import { getNightlyRates } from "@/lib/dal/booking-rates";

const { requireAuth, transaction } = vi.hoisted(() => ({
    requireAuth: vi.fn(),
    transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db", () => ({
    db: { transaction },
}));

vi.mock("@/lib/require-auth", () => ({
    requireAuth,
}));

vi.mock("@/lib/dal/booking-availability", () => ({
    findAvailableRoom: vi.fn(),
}));

vi.mock("@/lib/dal/booking-rates", () => ({
    getNightlyRates: vi.fn(),
}));

vi.mock("@/lib/services/booking-expiration-service", () => ({
    expireConflictingPendingBookingsInTransaction: vi.fn(),
}));

import { createBooking } from "@/lib/services/booking-service";

beforeEach(() => {
    vi.clearAllMocks();
});

it("rejects unauthenticated users before opening a transaction", async () => {
    requireAuth.mockRejectedValue(
        new Error("Unauthorized: Please sign in to continue."),
    );

    await expect(
        createBooking({
            roomTypeId: "550e8400-e29b-41d4-a716-446655440000",
            checkIn: "2026-11-01",
            checkOut: "2026-11-03",
            guestCount: 2,
            paymentMethod: "online",
        }),
    ).rejects.toThrow("Unauthorized");

    expect(transaction).not.toHaveBeenCalled();
});

it("rejects invalid input before opening a transaction", async () => {
    requireAuth.mockResolvedValue({
        user: { id: "guest-1" },
    });

    await expect(
        createBooking({
            roomTypeId: "not-a-uuid",
            checkIn: "2026-11-03",
            checkOut: "2026-11-01",
            guestCount: 0,
            paymentMethod: "invalid",
        }),
    ).rejects.toThrow();

    expect(transaction).not.toHaveBeenCalled();
});



it("creates a booking with the correct total and nightly records", async () => {
    requireAuth.mockResolvedValue({
        user: { id: "guest-1" },
    });

    vi.mocked(getNightlyRates).mockResolvedValue([
        { stayDate: "2026-11-01", pricePerNight: "100.00" },
        { stayDate: "2026-11-02", pricePerNight: "120.00" },
    ]);

    vi.mocked(findAvailableRoom).mockResolvedValue("room-1");

    const bookingReturning = vi.fn().mockResolvedValue([
        { id: "booking-1" },
    ]);
    const bookingValues = vi.fn().mockReturnValue({
        returning: bookingReturning,
    });

    const roomReturning = vi.fn().mockResolvedValue([
        { id: "booking-room-1" },
    ]);
    const roomValues = vi.fn().mockReturnValue({
        returning: roomReturning,
    });

    const nightsValues = vi.fn().mockResolvedValue(undefined);

    const tx = {
        insert: vi.fn()
            .mockReturnValueOnce({ values: bookingValues })
            .mockReturnValueOnce({ values: roomValues })
            .mockReturnValueOnce({ values: nightsValues }),
    };

    transaction.mockImplementation(async (callback) => callback(tx));

    const result = await createBooking({
        roomTypeId: "550e8400-e29b-41d4-a716-446655440000",
        checkIn: "2026-11-01",
        checkOut: "2026-11-03",
        guestCount: 2,
        paymentMethod: "online",
    });

    expect(result).toEqual({
        bookingId: "booking-1",
        totalPrice: "220.00",
    });

    expect(transaction).toHaveBeenCalledOnce();
    expect(tx.insert).toHaveBeenCalledTimes(3);
    expect(bookingValues).toHaveBeenCalledOnce();
    expect(roomValues).toHaveBeenCalledOnce();
    expect(nightsValues).toHaveBeenCalledOnce();

    expect(nightsValues).toHaveBeenCalledWith([
        {
            bookingRoomId: "booking-room-1",
            stayDate: "2026-11-01",
            pricePerNight: "100.00",
        },
        {
            bookingRoomId: "booking-room-1",
            stayDate: "2026-11-02",
            pricePerNight: "120.00",
        },
    ]);
});


it("does not insert a booking when no room is available", async () => {
    requireAuth.mockResolvedValue({
        user: { id: "guest-1" },
    });

    vi.mocked(getNightlyRates).mockResolvedValue([
        { stayDate: "2026-11-01", pricePerNight: "100.00" },
        { stayDate: "2026-11-02", pricePerNight: "120.00" },
    ]);

    vi.mocked(findAvailableRoom).mockResolvedValue(null);

    const tx = {
        insert: vi.fn(),
    };

    transaction.mockImplementation(async (callback) => callback(tx));

    await expect(
        createBooking({
            roomTypeId: "550e8400-e29b-41d4-a716-446655440000",
            checkIn: "2026-11-01",
            checkOut: "2026-11-03",
            guestCount: 2,
            paymentMethod: "online",
        }),
    ).rejects.toThrow(
        "No room is available for the selected dates.",
    );

    expect(transaction).toHaveBeenCalledOnce();
    expect(findAvailableRoom).toHaveBeenCalledOnce();
    expect(tx.insert).not.toHaveBeenCalled();
});


it("does not create a booking when nightly rates are unavailable", async () => {
    requireAuth.mockResolvedValue({
        user: { id: "guest-1" },
    });

    vi.mocked(getNightlyRates).mockResolvedValue(null);

    const tx = {
        insert: vi.fn(),
    };

    transaction.mockImplementation(async (callback) => callback(tx));

    await expect(
        createBooking({
            roomTypeId: "550e8400-e29b-41d4-a716-446655440000",
            checkIn: "2026-11-01",
            checkOut: "2026-11-03",
            guestCount: 2,
            paymentMethod: "online",
        }),
    ).rejects.toThrow("No rates available for the selected dates.");

    expect(getNightlyRates).toHaveBeenCalledOnce();
    expect(findAvailableRoom).not.toHaveBeenCalled();
    expect(tx.insert).not.toHaveBeenCalled();
});


it("converts a room-overlap database error into a friendly message", async () => {
    requireAuth.mockResolvedValue({
        user: { id: "guest-1" },
    });

    const databaseError = Object.assign(
        new Error("Exclusion constraint violation"),
        { code: "23P01" },
    );

    transaction.mockRejectedValue(databaseError);

    await expect(
        createBooking({
            roomTypeId: "550e8400-e29b-41d4-a716-446655440000",
            checkIn: "2026-11-01",
            checkOut: "2026-11-03",
            guestCount: 2,
            paymentMethod: "online",
        }),
    ).rejects.toThrow(
        "This room was just booked. Please select different dates or try again.",
    );

    expect(transaction).toHaveBeenCalledOnce();
});
