import { Pool } from "@neondatabase/serverless";
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { getTestDatabaseUrl } from "../database-safety";
import { createBookingRoomFixture } from "./booking-room-fixture";

vi.mock("server-only", () => ({}));

const databaseUrl = getTestDatabaseUrl();
const pool = new Pool({ connectionString: databaseUrl });

let expireConflictingPendingBookingsInTransaction:
    typeof import("@/lib/services/booking-expiration-service")
    .expireConflictingPendingBookingsInTransaction;

let serviceDb: typeof import("@/lib/db").db | undefined;

beforeAll(async () => {
    process.env.DATABASE_URL = databaseUrl;

    ({
        expireConflictingPendingBookingsInTransaction,
    } = await import("@/lib/services/booking-expiration-service"));

    ({ db: serviceDb } = await import("@/lib/db"));
});

afterAll(async () => {
    await serviceDb?.$client.end();
    await pool.end();
});

describe("conflicting pending booking expiration integration", () => {
    it(
        "cancels an expired conflicting booking and preserves a non-conflicting booking",
        async () => {
            const client = await pool.connect();
            let fixture:
                | Awaited<ReturnType<typeof createBookingRoomFixture>>
                | undefined;

            try {
                await client.query("BEGIN");
                fixture = await createBookingRoomFixture(client);

                // First booking: expired and overlaps the requested dates.
                await client.query(
                    `INSERT INTO public.booking_rooms
                     (booking_id, room_id, check_in, check_out, price_per_night)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        fixture.firstBookingId,
                        fixture.roomId,
                        "2030-01-10",
                        "2030-01-13",
                        "100.00",
                    ],
                );

                await client.query(
                    `UPDATE public.bookings
                     SET payment_method = 'online',
                         payment_status = 'pending',
                         status = 'pending',
                         expires_at = NOW() - INTERVAL '1 hour'
                     WHERE id = $1`,
                    [fixture.firstBookingId],
                );

                // Second booking: also expired, but dates do not overlap.
                await client.query(
                    `UPDATE public.bookings
                     SET check_in = $2,
                         check_out = $3,
                         payment_method = 'online',
                         payment_status = 'pending',
                         status = 'pending',
                         expires_at = NOW() - INTERVAL '1 hour'
                     WHERE id = $1`,
                    [
                        fixture.secondBookingId,
                        "2030-01-20",
                        "2030-01-23",
                    ],
                );

                await client.query(
                    `INSERT INTO public.booking_rooms
                     (booking_id, room_id, check_in, check_out, price_per_night)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        fixture.secondBookingId,
                        fixture.roomId,
                        "2030-01-20",
                        "2030-01-23",
                        "100.00",
                    ],
                );

                // The service uses a separate database connection.
                await client.query("COMMIT");

                const result = await serviceDb!.transaction((tx) =>
                    expireConflictingPendingBookingsInTransaction(tx, {
                        roomTypeId: fixture!.roomTypeId,
                        checkIn: "2030-01-10",
                        checkOut: "2030-01-13",
                    }),
                );

                expect(result.expiredCount).toBe(1);

                const bookingResult = await client.query(
                    `SELECT status
                     FROM public.bookings
                     WHERE id = $1`,
                    [fixture.firstBookingId],
                );

                const roomResult = await client.query(
                    `SELECT is_active
                     FROM public.booking_rooms
                     WHERE booking_id = $1
                       AND room_id = $2`,
                    [fixture.firstBookingId, fixture.roomId],
                );

                expect(bookingResult.rows[0]?.status).toBe("cancelled");
                expect(roomResult.rows[0]?.is_active).toBe(false);

                const nonConflictingBookingResult = await client.query(
                    `SELECT status
                     FROM public.bookings
                     WHERE id = $1`,
                    [fixture.secondBookingId],
                );

                const nonConflictingRoomResult = await client.query(
                    `SELECT is_active
                     FROM public.booking_rooms
                     WHERE booking_id = $1
                       AND room_id = $2`,
                    [fixture.secondBookingId, fixture.roomId],
                );

                expect(nonConflictingBookingResult.rows[0]?.status).toBe(
                    "pending",
                );
                expect(nonConflictingRoomResult.rows[0]?.is_active).toBe(true);
            } finally {
                if (fixture) {
                    // Delete test data in foreign-key-safe order.
                    await client.query(
                        `DELETE FROM public.booking_rooms
                         WHERE booking_id = ANY($1::uuid[])`,
                        [[fixture.firstBookingId, fixture.secondBookingId]],
                    );

                    await client.query(
                        `DELETE FROM public.bookings
                         WHERE id = ANY($1::uuid[])`,
                        [[fixture.firstBookingId, fixture.secondBookingId]],
                    );

                    await client.query(
                        `DELETE FROM public.room_rates
                         WHERE room_type_id = $1`,
                        [fixture.roomTypeId],
                    );

                    await client.query(
                        `DELETE FROM public.rooms WHERE id = $1`,
                        [fixture.roomId],
                    );

                    await client.query(
                        `DELETE FROM public.room_types WHERE id = $1`,
                        [fixture.roomTypeId],
                    );

                    await client.query(
                        `DELETE FROM public.hotels WHERE id = $1`,
                        [fixture.hotelId],
                    );

                    await client.query(
                        `DELETE FROM auth."user" WHERE id = $1`,
                        [fixture.guestId],
                    );
                }

                client.release();
            }
        },
        30_000,
    );
});