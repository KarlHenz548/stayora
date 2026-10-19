import { randomUUID } from "node:crypto";


type TestClient = {
    query(
        sql: string,
        params?: unknown[],
    ): Promise<unknown>;
};
export function createBookingRoomFixtureIds() {
    return {
        guestId: `test-${randomUUID()}`,
        hotelId: randomUUID(),
        roomTypeId: randomUUID(),
        roomId: randomUUID(),
        firstBookingId: randomUUID(),
        secondBookingId: randomUUID(),
    };
}

export async function createBookingRoomFixture(client: TestClient) {
    const ids = createBookingRoomFixtureIds();

    // 1. Create test guest
    await client.query(
        `INSERT INTO auth."user" (id, name, email)
     VALUES ($1, $2, $3)`,
        [
            ids.guestId,
            "Integration Test Guest",
            `${ids.guestId}@example.test`,
        ],
    );

    // 2. Create test hotel
    await client.query(
        `INSERT INTO public.hotels
      (id, name, slug, description, address, city, country, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
            ids.hotelId,
            "Integration Test Hotel",
            `test-${ids.hotelId}`,
            "Temporary integration test hotel",
            "Test Address",
            "Test City",
            "Philippines",
            "published",
        ],
    );

    // 3. Create room type
    await client.query(
        `INSERT INTO public.room_types
      (id, hotel_id, name, description, capacity, bed_configuration)
     VALUES ($1, $2, $3, $4, $5, $6)`,
        [
            ids.roomTypeId,
            ids.hotelId,
            "Test Room",
            "Temporary integration test room type",
            2,
            "1 Queen Bed",
        ],
    );

    // 4. Create physical room
    await client.query(
        `INSERT INTO public.rooms
      (id, hotel_id, room_type_id, room_number)
     VALUES ($1, $2, $3, $4)`,
        [
            ids.roomId,
            ids.hotelId,
            ids.roomTypeId,
            "TEST-101",
        ],
    );

    // 5. Create room rate
    await client.query(
        `INSERT INTO public.room_rates
      (room_type_id, start_date, end_date, price_per_night)
     VALUES ($1, $2, $3, $4)`,
        [ids.roomTypeId, "2030-01-01", "2030-02-01", "100.00"],
    );

    // 6. Create two test bookings
    for (const bookingId of [
        ids.firstBookingId,
        ids.secondBookingId,
    ]) {
        await client.query(
            `INSERT INTO public.bookings
        (id, guest_id, check_in, check_out, payment_method, total_price)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                bookingId,
                ids.guestId,
                "2030-01-10",
                "2030-01-13",
                "pay_at_hotel",
                "300.00",
            ],
        );
    }

    return ids;
}
