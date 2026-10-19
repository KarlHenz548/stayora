import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { roomTypes, rooms } from "../lib/db/schema";

async function main() {
    const results = await db
        .select({
            roomTypeName: roomTypes.name,
            roomTypeId: roomTypes.id,
            hotelId: roomTypes.hotelId,
            roomNumber: rooms.roomNumber,
        })
        .from(roomTypes)
        .leftJoin(
            rooms,
            and(
                eq(rooms.roomTypeId, roomTypes.id),
                eq(rooms.hotelId, roomTypes.hotelId),
            ),
        )
        .orderBy(roomTypes.name);

    console.table(results);
    process.exitCode = 0;
}

main().catch((error: unknown) => {
    console.error("Failed to inspect room types:", error);
    process.exitCode = 1;
});