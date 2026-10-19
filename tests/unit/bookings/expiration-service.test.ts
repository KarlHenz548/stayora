
import { expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({
    db: {},
}));

it("returns zero when no pending bookings have expired", async () => {
    const { expirePendingBookingsInTransaction } = await import(
        "../../../lib/services/booking-expiration-service"
    );

    const forUpdate = vi.fn().mockResolvedValue([]);
    const limit = vi.fn().mockReturnValue({ for: forUpdate });
    const orderBy = vi.fn().mockReturnValue({ limit });
    const where = vi.fn().mockReturnValue({ orderBy });
    const from = vi.fn().mockReturnValue({ where });
    const select = vi.fn().mockReturnValue({ from });
    const update = vi.fn();

    const tx = { select, update } as never;

    const result = await expirePendingBookingsInTransaction(tx);

    expect(result).toEqual({ expiredCount: 0 });
    expect(select).toHaveBeenCalledOnce();
    expect(update).not.toHaveBeenCalled();
});

it("does not deactivate room assignments when no bookings are cancelled", async () => {
    const { expirePendingBookingsInTransaction } = await import(
        "../../../lib/services/booking-expiration-service"
    );

    const forUpdate = vi.fn().mockResolvedValue([{ id: "booking-1" }]);
    const limit = vi.fn().mockReturnValue({ for: forUpdate });
    const orderBy = vi.fn().mockReturnValue({ limit });
    const where = vi.fn().mockReturnValue({ orderBy });
    const from = vi.fn().mockReturnValue({ where });
    const select = vi.fn().mockReturnValue({ from });

    const returning = vi.fn().mockResolvedValue([]);
    const updateWhere = vi.fn().mockReturnValue({ returning });
    const set = vi.fn().mockReturnValue({ where: updateWhere });
    const update = vi.fn().mockReturnValue({ set });

    const tx = { select, update } as never;

    const result = await expirePendingBookingsInTransaction(tx);

    expect(result).toEqual({ expiredCount: 0 });
    expect(update).toHaveBeenCalledOnce();
    expect(returning).toHaveBeenCalledOnce();
});


it("deactivates room assignments when a booking is cancelled", async () => {
    const { expirePendingBookingsInTransaction } = await import(
        "../../../lib/services/booking-expiration-service"
    );

    const forUpdate = vi.fn().mockResolvedValue([{ id: "booking-1" }]);
    const limit = vi.fn().mockReturnValue({ for: forUpdate });
    const orderBy = vi.fn().mockReturnValue({ limit });
    const selectWhere = vi.fn().mockReturnValue({ orderBy });
    const from = vi.fn().mockReturnValue({ where: selectWhere });
    const select = vi.fn().mockReturnValue({ from });

    const returning = vi.fn().mockResolvedValue([{ id: "booking-1" }]);
    const bookingWhere = vi.fn().mockReturnValue({ returning });
    const bookingSet = vi.fn().mockReturnValue({ where: bookingWhere });

    const roomWhere = vi.fn().mockResolvedValue(undefined);
    const roomSet = vi.fn().mockReturnValue({ where: roomWhere });

    const update = vi
        .fn()
        .mockReturnValueOnce({ set: bookingSet })
        .mockReturnValueOnce({ set: roomSet });

    const tx = { select, update } as never;

    const result = await expirePendingBookingsInTransaction(tx);

    expect(result).toEqual({ expiredCount: 1 });
    expect(update).toHaveBeenCalledTimes(2);
    expect(returning).toHaveBeenCalledOnce();
    expect(roomSet).toHaveBeenCalledOnce();
    expect(roomWhere).toHaveBeenCalledOnce();
    expect(bookingSet).toHaveBeenCalledWith({
        status: "cancelled",
    });

    expect(roomSet).toHaveBeenCalledWith({
        isActive: false,
    });
});


it("returns zero when no conflicting expired bookings are found", async () => {
    const {
        expireConflictingPendingBookingsInTransaction,
    } = await import(
        "../../../lib/services/booking-expiration-service"
    );

    const forUpdate = vi.fn().mockResolvedValue([]);
    const orderBy = vi.fn().mockReturnValue({ for: forUpdate });

    const outerWhere = vi.fn().mockReturnValue({ orderBy });
    const outerFrom = vi.fn().mockReturnValue({ where: outerWhere });

    const innerWhere = vi.fn();
    const innerJoin = vi.fn().mockReturnValue({ where: innerWhere });
    const innerFrom = vi.fn().mockReturnValue({ innerJoin });


    const select = vi
        .fn()
        .mockReturnValueOnce({ from: outerFrom })
        .mockReturnValueOnce({ from: innerFrom });

    const update = vi.fn();

    const tx = { select, update } as never;

    const result = await expireConflictingPendingBookingsInTransaction(
        tx,
        {
            roomTypeId: "room-type-1",
            checkIn: "2026-11-01",
            checkOut: "2026-11-03",
        },
    );

    expect(result).toEqual({ expiredCount: 0 });
    expect(update).not.toHaveBeenCalled();
});


it("cancels conflicting expired bookings and deactivates their room assignments", async () => {
    const {
        expireConflictingPendingBookingsInTransaction,
    } = await import(
        "../../../lib/services/booking-expiration-service"
    );

    const forUpdate = vi.fn().mockResolvedValue([
        { id: "booking-1" },
    ]);
    const orderBy = vi.fn().mockReturnValue({ for: forUpdate });

    const outerWhere = vi.fn().mockReturnValue({ orderBy });
    const outerFrom = vi.fn().mockReturnValue({ where: outerWhere });

    const innerWhere = vi.fn();
    const innerJoin = vi.fn().mockReturnValue({ where: innerWhere });
    const innerFrom = vi.fn().mockReturnValue({ innerJoin });

    const select = vi
        .fn()
        .mockReturnValueOnce({ from: outerFrom })
        .mockReturnValueOnce({ from: innerFrom });

    const returning = vi.fn().mockResolvedValue([
        { id: "booking-1" },
    ]);
    const bookingWhere = vi.fn().mockReturnValue({ returning });
    const bookingSet = vi.fn().mockReturnValue({
        where: bookingWhere,
    });

    const roomWhere = vi.fn().mockResolvedValue(undefined);
    const roomSet = vi.fn().mockReturnValue({ where: roomWhere });

    const update = vi
        .fn()
        .mockReturnValueOnce({ set: bookingSet })
        .mockReturnValueOnce({ set: roomSet });

    const tx = { select, update } as never;

    const result = await expireConflictingPendingBookingsInTransaction(
        tx,
        {
            roomTypeId: "room-type-1",
            checkIn: "2026-11-01",
            checkOut: "2026-11-03",
        },
    );

    expect(result).toEqual({ expiredCount: 1 });
    expect(bookingSet).toHaveBeenCalledWith({
        status: "cancelled",
    });
    expect(roomSet).toHaveBeenCalledWith({
        isActive: false,
    });
    expect(update).toHaveBeenCalledTimes(2);
});
