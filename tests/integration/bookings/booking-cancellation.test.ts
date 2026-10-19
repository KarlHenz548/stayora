
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

const { requireAuth } = vi.hoisted(() => ({
    requireAuth: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/require-auth", () => ({
    requireAuth,
}));

const databaseUrl = getTestDatabaseUrl();
const pool = new Pool({ connectionString: databaseUrl });

let cancelBooking: typeof import("@/lib/services/booking-cancellation-service").cancelBooking;
let serviceDb: typeof import("@/lib/db").db | undefined;

beforeAll(async () => {
    // The service's DB module must initialize with the validated test URL.
    process.env.DATABASE_URL = databaseUrl;

    ({ cancelBooking } = await import(
        "@/lib/services/booking-cancellation-service"
    ));

    ({ db: serviceDb } = await import("@/lib/db"));
});

afterAll(async () => {
    await serviceDb?.$client.end();
    await pool.end();
});

describe("booking cancellation service integration", () => {
    it(
        "cancels the booking, releases its room, and permits a replacement",
        async () => {
            const client = await pool.connect();
            let fixture:
                | Awaited<ReturnType<typeof createBookingRoomFixture>>
                | undefined;

            try {
                await client.query("BEGIN");
                fixture = await createBookingRoomFixture(client);

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

                // Commit fixture data so the service's separate connection
                // can see it. The finally block removes these test records.
                await client.query("COMMIT");

                requireAuth.mockResolvedValue({
                    user: { id: fixture.guestId },
                });

                const result = await cancelBooking(fixture.firstBookingId);

                expect(result).toEqual({
                    bookingId: fixture.firstBookingId,
                });

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

                await expect(
                    client.query(
                        `INSERT INTO public.booking_rooms
                         (booking_id, room_id, check_in, check_out, price_per_night)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [
                            fixture.secondBookingId,
                            fixture.roomId,
                            "2030-01-10",
                            "2030-01-13",
                            "100.00",
                        ],
                    ),
                ).resolves.toBeDefined();

                const replacementResult = await client.query(
                    `SELECT status
                     FROM public.bookings
                     WHERE id = $1`,
                    [fixture.secondBookingId],
                );

                expect(replacementResult.rows[0]?.status).toBe("pending");
            } finally {
                if (fixture) {
                    // The fixture was committed before the service ran.
                    // Clean it up explicitly, in foreign-key-safe order.
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
