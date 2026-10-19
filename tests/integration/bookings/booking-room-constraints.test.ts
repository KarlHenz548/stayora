
import { Pool } from "@neondatabase/serverless";
import { afterAll, describe, expect, it } from "vitest";
import { getTestDatabaseUrl } from "../database-safety";
import { createBookingRoomFixture } from "./booking-room-fixture";

const pool = new Pool({
    connectionString: getTestDatabaseUrl(),
});

afterAll(async () => {
    await pool.end();
});

describe("booking room database constraints", () => {
    it(
        "rejects overlapping active bookings for the same room",
        async () => {
            const client = await pool.connect();

            try {
                await client.query("BEGIN");

                const {
                    roomId,
                    firstBookingId,
                    secondBookingId,
                } = await createBookingRoomFixture(client);

                await client.query(
                    `INSERT INTO public.booking_rooms
            (booking_id, room_id, check_in, check_out, price_per_night)
           VALUES ($1, $2, $3, $4, $5)`,
                    [
                        firstBookingId,
                        roomId,
                        "2030-01-10",
                        "2030-01-13",
                        "100.00",
                    ],
                );

                await client.query("SAVEPOINT overlap_check");

                let overlapError: unknown;

                try {
                    await client.query(
                        `INSERT INTO public.booking_rooms
              (booking_id, room_id, check_in, check_out, price_per_night)
             VALUES ($1, $2, $3, $4, $5)`,
                        [
                            secondBookingId,
                            roomId,
                            "2030-01-12",
                            "2030-01-15",
                            "100.00",
                        ],
                    );
                } catch (error) {
                    overlapError = error;
                }

                await client.query(
                    "ROLLBACK TO SAVEPOINT overlap_check",
                );

                expect(overlapError).toBeDefined();
                expect(
                    (overlapError as { code?: string }).code,
                ).toBe("23P01");
            } finally {
                await client.query("ROLLBACK");
                client.release();
            }
        },
        20_000,
    );

    it(
        "allows consecutive bookings when checkout equals the next check-in",
        async () => {
            const client = await pool.connect();

            try {
                await client.query("BEGIN");

                const {
                    roomId,
                    firstBookingId,
                    secondBookingId,
                } = await createBookingRoomFixture(client);

                await client.query(
                    `INSERT INTO public.booking_rooms
            (booking_id, room_id, check_in, check_out, price_per_night)
           VALUES ($1, $2, $3, $4, $5)`,
                    [
                        firstBookingId,
                        roomId,
                        "2030-01-10",
                        "2030-01-13",
                        "100.00",
                    ],
                );

                await expect(
                    client.query(
                        `INSERT INTO public.booking_rooms
              (booking_id, room_id, check_in, check_out, price_per_night)
             VALUES ($1, $2, $3, $4, $5)`,
                        [
                            secondBookingId,
                            roomId,
                            "2030-01-13",
                            "2030-01-15",
                            "100.00",
                        ],
                    ),
                ).resolves.toBeDefined();
            } finally {
                await client.query("ROLLBACK");
                client.release();
            }
        },
        20_000,
    );

    it(
        "allows a new booking when the existing booking is inactive",
        async () => {
            const client = await pool.connect();

            try {
                await client.query("BEGIN");

                const {
                    roomId,
                    firstBookingId,
                    secondBookingId,
                } = await createBookingRoomFixture(client);

                await client.query(
                    `INSERT INTO public.booking_rooms
            (
              booking_id,
              room_id,
              check_in,
              check_out,
              price_per_night,
              is_active
            )
           VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        firstBookingId,
                        roomId,
                        "2030-01-10",
                        "2030-01-13",
                        "100.00",
                        false,
                    ],
                );

                await expect(
                    client.query(
                        `INSERT INTO public.booking_rooms
              (booking_id, room_id, check_in, check_out, price_per_night)
             VALUES ($1, $2, $3, $4, $5)`,
                        [
                            secondBookingId,
                            roomId,
                            "2030-01-10",
                            "2030-01-13",
                            "100.00",
                        ],
                    ),
                ).resolves.toBeDefined();
            } finally {
                await client.query("ROLLBACK");
                client.release();
            }
        },
        20_000,
    );

    it(
        "rejects invalid booking date ranges",
        async () => {
            const client = await pool.connect();

            try {
                await client.query("BEGIN");

                const {
                    roomId,
                    secondBookingId,
                } = await createBookingRoomFixture(client);

                const invalidRanges = [
                    {
                        checkIn: "2030-01-13",
                        checkOut: "2030-01-13",
                    },
                    {
                        checkIn: "2030-01-15",
                        checkOut: "2030-01-13",
                    },
                ];

                for (const [index, dates] of invalidRanges.entries()) {
                    const savepoint = `invalid_date_${index}`;

                    await client.query(`SAVEPOINT ${savepoint}`);

                    let dateError: unknown;

                    try {
                        await client.query(
                            `INSERT INTO public.booking_rooms
                (booking_id, room_id, check_in, check_out, price_per_night)
               VALUES ($1, $2, $3, $4, $5)`,
                            [
                                secondBookingId,
                                roomId,
                                dates.checkIn,
                                dates.checkOut,
                                "100.00",
                            ],
                        );
                    } catch (error) {
                        dateError = error;
                    }

                    await client.query(
                        `ROLLBACK TO SAVEPOINT ${savepoint}`,
                    );

                    expect(dateError).toBeDefined();
                    expect(
                        (dateError as { code?: string }).code,
                    ).toBe("23514");
                }
            } finally {
                await client.query("ROLLBACK");
                client.release();
            }
        },
        20_000,
    );

    it(
        "allows a replacement booking after an active booking is deactivated",
        async () => {
            const client = await pool.connect();

            try {
                await client.query("BEGIN");

                const {
                    roomId,
                    firstBookingId,
                    secondBookingId,
                } = await createBookingRoomFixture(client);

                await client.query(
                    `INSERT INTO public.booking_rooms
            (booking_id, room_id, check_in, check_out, price_per_night)
           VALUES ($1, $2, $3, $4, $5)`,
                    [
                        firstBookingId,
                        roomId,
                        "2030-01-10",
                        "2030-01-13",
                        "100.00",
                    ],
                );

                await client.query(
                    `UPDATE public.booking_rooms
           SET is_active = false
           WHERE booking_id = $1
             AND room_id = $2`,
                    [firstBookingId, roomId],
                );

                await expect(
                    client.query(
                        `INSERT INTO public.booking_rooms
              (booking_id, room_id, check_in, check_out, price_per_night)
             VALUES ($1, $2, $3, $4, $5)`,
                        [
                            secondBookingId,
                            roomId,
                            "2030-01-10",
                            "2030-01-13",
                            "100.00",
                        ],
                    ),
                ).resolves.toBeDefined();
            } finally {
                await client.query("ROLLBACK");
                client.release();
            }
        },
        20_000,
    );

    it(
        "releases a cancelled booking's room and allows a replacement booking",
        async () => {
            const client = await pool.connect();

            try {
                await client.query("BEGIN");

                const {
                    roomId,
                    firstBookingId,
                    secondBookingId,
                } = await createBookingRoomFixture(client);

                await client.query(
                    `INSERT INTO public.booking_rooms
          (booking_id, room_id, check_in, check_out, price_per_night)
         VALUES ($1, $2, $3, $4, $5)`,
                    [
                        firstBookingId,
                        roomId,
                        "2030-01-10",
                        "2030-01-13",
                        "100.00",
                    ],
                );

                // Simulate the database updates performed by cancellation.
                await client.query(
                    `UPDATE public.bookings
         SET status = 'cancelled'
         WHERE id = $1`,
                    [firstBookingId],
                );

                await client.query(
                    `UPDATE public.booking_rooms
         SET is_active = false
         WHERE booking_id = $1
           AND is_active = true`,
                    [firstBookingId],
                );

                const bookingResult = await client.query(
                    `SELECT status
         FROM public.bookings
         WHERE id = $1`,
                    [firstBookingId],
                ) as { rows: { status: string }[] };

                const roomResult = await client.query(
                    `SELECT is_active
         FROM public.booking_rooms
         WHERE booking_id = $1
           AND room_id = $2`,
                    [firstBookingId, roomId],
                ) as { rows: { is_active: boolean }[] };

                expect(bookingResult.rows[0]?.status).toBe("cancelled");
                expect(roomResult.rows[0]?.is_active).toBe(false);

                await expect(
                    client.query(
                        `INSERT INTO public.booking_rooms
              (booking_id, room_id, check_in, check_out, price_per_night)
             VALUES ($1, $2, $3, $4, $5)`,
                        [
                            secondBookingId,
                            roomId,
                            "2030-01-10",
                            "2030-01-13",
                            "100.00",
                        ],
                    ),
                ).resolves.toBeDefined();
            } finally {
                await client.query("ROLLBACK");
                client.release();
            }
        },
        20_000,
    );

});
