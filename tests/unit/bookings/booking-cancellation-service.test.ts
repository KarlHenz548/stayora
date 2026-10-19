
import { beforeEach, expect, it, vi } from "vitest";

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

import { cancelBooking } from "@/lib/services/booking-cancellation-service";

const validBooking = {
    id: "booking-1",
    guestId: "guest-1",
    checkIn: "2026-11-01",
    status: "confirmed",
};

function setupTransaction(
    bookingRows = [validBooking],
    updatedRows = [{ id: "booking-1" }],
) {
    const forUpdate = vi.fn().mockResolvedValue(bookingRows);
    const limit = vi.fn().mockReturnValue({ for: forUpdate });
    const selectWhere = vi.fn().mockReturnValue({ limit });
    const from = vi.fn().mockReturnValue({ where: selectWhere });

    const select = vi.fn().mockReturnValue({ from });

    const bookingReturning = vi.fn().mockResolvedValue(updatedRows);
    const bookingUpdateWhere = vi.fn().mockReturnValue({
        returning: bookingReturning,
    });
    const bookingSet = vi.fn().mockReturnValue({
        where: bookingUpdateWhere,
    });

    const roomUpdateWhere = vi.fn().mockResolvedValue(undefined);
    const roomSet = vi.fn().mockReturnValue({
        where: roomUpdateWhere,
    });

    const update = vi.fn()
        .mockReturnValueOnce({ set: bookingSet })
        .mockReturnValueOnce({ set: roomSet });

    const tx = { select, update };

    transaction.mockImplementation(
        async (callback) => callback(tx),
    );

    return { tx, bookingSet, roomSet, update };
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
});

it("rejects unauthenticated guests before opening a transaction", async () => {
    requireAuth.mockRejectedValue(
        new Error("Unauthorized: Please sign in to continue."),
    );

    await expect(cancelBooking("booking-1")).rejects.toThrow(
        "Unauthorized",
    );

    expect(transaction).not.toHaveBeenCalled();
});

it("rejects a booking that does not belong to the guest", async () => {
    requireAuth.mockResolvedValue({ user: { id: "guest-1" } });
    setupTransaction([]);

    await expect(cancelBooking("booking-1")).rejects.toThrow(
        "Booking not found",
    );
});

it("rejects bookings that are already cancelled", async () => {
    requireAuth.mockResolvedValue({ user: { id: "guest-1" } });
    setupTransaction([
        { ...validBooking, status: "cancelled" },
    ]);

    await expect(cancelBooking("booking-1")).rejects.toThrow(
        "This booking can no longer be cancelled.",
    );
});

it("rejects cancellation inside the 24-hour cutoff", async () => {
    requireAuth.mockResolvedValue({ user: { id: "guest-1" } });

    // Check-in starts Nov 1 at midnight in the Philippines.
    // The cutoff is Oct 31 at midnight in the Philippines.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-30T17:00:00.000Z"));

    setupTransaction();

    await expect(cancelBooking("booking-1")).rejects.toThrow(
        "at least 24 hours before check-in",
    );
});

it("cancels an eligible booking and releases its active room assignments", async () => {
    requireAuth.mockResolvedValue({ user: { id: "guest-1" } });

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-30T15:00:00.000Z"));

    const { bookingSet, roomSet, update } = setupTransaction();

    await expect(cancelBooking("booking-1")).resolves.toEqual({
        bookingId: "booking-1",
    });

    expect(bookingSet).toHaveBeenCalledWith({
        status: "cancelled",
    });

    expect(roomSet).toHaveBeenCalledWith({
        isActive: false,
    });

    expect(update).toHaveBeenCalledTimes(2);
});


it("rejects cancellation when the conditional update affects no booking", async () => {
    requireAuth.mockResolvedValue({ user: { id: "guest-1" } });

    const { roomSet } = setupTransaction([validBooking], []);

    await expect(cancelBooking("booking-1")).rejects.toThrow(
        "This booking can no longer be cancelled.",
    );

    expect(roomSet).not.toHaveBeenCalled();
});
