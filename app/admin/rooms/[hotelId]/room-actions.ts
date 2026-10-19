
"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hotels, roomRates, rooms, roomTypes } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { roomRateSchema } from "@/lib/validations/room-rate";
import { roomSchema } from "@/lib/validations/room";
import { roomTypeSchema } from "@/lib/validations/room-type";

export type RoomFormState = {
    error: string | null;
    success: boolean;
};

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const placeholderRoomTypeId =
    "00000000-0000-4000-8000-000000000000";

export async function createRoomAction(
    _previousState: RoomFormState,
    formData: FormData,
): Promise<RoomFormState> {
    await requireAdmin();

    const hotelId = formData.get("hotelId");
    const parsed = roomSchema.safeParse({
        roomNumber: formData.get("roomNumber"),
        roomTypeId: formData.get("roomTypeId"),
    });

    if (typeof hotelId !== "string" || !uuidRegex.test(hotelId)) {
        return { error: "Invalid hotel ID.", success: false };
    }

    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Please check your inputs.",
            success: false,
        };
    }

    try {
        const [hotel] = await db
            .select({ id: hotels.id })
            .from(hotels)
            .where(eq(hotels.id, hotelId))
            .limit(1);

        if (!hotel) {
            return { error: "Hotel not found.", success: false };
        }

        const [roomType] = await db
            .select({ id: roomTypes.id })
            .from(roomTypes)
            .where(
                and(
                    eq(roomTypes.id, parsed.data.roomTypeId),
                    eq(roomTypes.hotelId, hotelId),
                ),
            )
            .limit(1);

        if (!roomType) {
            return {
                error: "Please select a room type belonging to this hotel.",
                success: false,
            };
        }

        await db.insert(rooms).values({
            hotelId,
            roomTypeId: roomType.id,
            roomNumber: parsed.data.roomNumber,
        });

        revalidatePath(`/admin/rooms/${hotelId}`);
        revalidatePath("/admin/rooms");

        return { error: null, success: true };
    } catch {
        return {
            error:
                "Unable to create room. The room number may already exist for this hotel.",
            success: false,
        };
    }
}

export async function updateRoomAction(
    _previousState: RoomFormState,
    formData: FormData,
): Promise<RoomFormState> {
    await requireAdmin();

    const hotelId = formData.get("hotelId");
    const roomId = formData.get("roomId");

    if (typeof hotelId !== "string" || !uuidRegex.test(hotelId)) {
        return { error: "Invalid hotel ID.", success: false };
    }

    if (typeof roomId !== "string" || !uuidRegex.test(roomId)) {
        return { error: "Invalid room ID.", success: false };
    }

    const parsedRoom = roomSchema.safeParse({
        roomNumber: formData.get("roomNumber"),
        roomTypeId: placeholderRoomTypeId,
    });

    if (!parsedRoom.success) {
        return {
            error:
                parsedRoom.error.issues[0]?.message ?? "Please check the room number.",
            success: false,
        };
    }

    const parsedRoomType = roomTypeSchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
        capacity: formData.get("capacity"),
        bedConfiguration: formData.get("bedConfiguration"),
    });

    if (!parsedRoomType.success) {
        return {
            error:
                parsedRoomType.error.issues[0]?.message ??
                "Please check the room details.",
            success: false,
        };
    }

    const rateIds = formData.getAll("rateId");
    const startDates = formData.getAll("startDate");
    const endDates = formData.getAll("endDate");
    const prices = formData.getAll("pricePerNight");

    if (
        !rateIds.every(
            (value) => typeof value === "string" && uuidRegex.test(value),
        ) ||
        !startDates.every((value) => typeof value === "string") ||
        !endDates.every((value) => typeof value === "string") ||
        !prices.every((value) => typeof value === "string")
    ) {
        return {
            error: "Invalid pricing data. Please review the rate periods.",
            success: false,
        };
    }

    if (
        rateIds.length !== startDates.length ||
        rateIds.length !== endDates.length ||
        rateIds.length !== prices.length ||
        new Set(rateIds).size !== rateIds.length
    ) {
        return {
            error: "Pricing data is incomplete. Please review every rate period.",
            success: false,
        };
    }

    const parsedRates: {
        id: string;
        startDate: string;
        endDate: string;
        pricePerNight: string;
    }[] = [];

    for (let index = 0; index < rateIds.length; index += 1) {
        const parsedRate = roomRateSchema.safeParse({
            roomTypeId: placeholderRoomTypeId,
            startDate: startDates[index],
            endDate: endDates[index],
            pricePerNight: prices[index],
        });

        if (!parsedRate.success) {
            return {
                error:
                    parsedRate.error.issues[0]?.message ??
                    `Please check pricing period ${index + 1}.`,
                success: false,
            };
        }

        parsedRates.push({
            id: rateIds[index] as string,
            startDate: parsedRate.data.startDate,
            endDate: parsedRate.data.endDate,
            pricePerNight: parsedRate.data.pricePerNight.toFixed(2),
        });
    }

    try {
        await db.transaction(async (tx) => {
            const [hotel] = await tx
                .select({ id: hotels.id })
                .from(hotels)
                .where(eq(hotels.id, hotelId))
                .limit(1);

            if (!hotel) throw new Error("HOTEL_NOT_FOUND");

            const [currentRoom] = await tx
                .select({
                    id: rooms.id,
                    roomTypeId: rooms.roomTypeId,
                })
                .from(rooms)
                .where(and(eq(rooms.id, roomId), eq(rooms.hotelId, hotelId)))
                .limit(1);

            if (!currentRoom) throw new Error("ROOM_NOT_FOUND");

            const [currentRoomType] = await tx
                .select({ id: roomTypes.id })
                .from(roomTypes)
                .where(
                    and(
                        eq(roomTypes.id, currentRoom.roomTypeId),
                        eq(roomTypes.hotelId, hotelId),
                    ),
                )
                .limit(1);

            if (!currentRoomType) throw new Error("ROOM_TYPE_NOT_FOUND");

            const existingRates = await tx
                .select({
                    id: roomRates.id,
                    startDate: roomRates.startDate,
                    endDate: roomRates.endDate,
                    pricePerNight: roomRates.pricePerNight,
                })
                .from(roomRates)
                .where(eq(roomRates.roomTypeId, currentRoom.roomTypeId));

            // Require the complete set of existing rates to be submitted.
            const existingRateIds = existingRates.map((rate) => rate.id).sort();
            const submittedRateIds = parsedRates.map((rate) => rate.id).sort();

            if (
                existingRateIds.length !== submittedRateIds.length ||
                existingRateIds.some((id, index) => id !== submittedRateIds[index])
            ) {
                throw new Error("PRICING_CHANGED");
            }

            const [anotherRoom] = await tx
                .select({ id: rooms.id })
                .from(rooms)
                .where(
                    and(
                        eq(rooms.hotelId, hotelId),
                        eq(rooms.roomTypeId, currentRoom.roomTypeId),
                        ne(rooms.id, roomId),
                    ),
                )
                .limit(1);

            let targetRoomTypeId = currentRoom.roomTypeId;

            if (anotherRoom) {
                // Isolate this room from other rooms using the same room type.
                const [newRoomType] = await tx
                    .insert(roomTypes)
                    .values({
                        hotelId,
                        ...parsedRoomType.data,
                    })
                    .returning({ id: roomTypes.id });

                if (parsedRates.length > 0) {
                    await tx.insert(roomRates).values(
                        parsedRates.map((rate) => ({
                            roomTypeId: newRoomType.id,
                            startDate: rate.startDate,
                            endDate: rate.endDate,
                            pricePerNight: rate.pricePerNight,
                        })),
                    );
                }

                targetRoomTypeId = newRoomType.id;
            } else {
                await tx
                    .update(roomTypes)
                    .set({
                        ...parsedRoomType.data,
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(roomTypes.id, currentRoom.roomTypeId),
                            eq(roomTypes.hotelId, hotelId),
                        ),
                    );

                // Update rates in place so their existing IDs remain stable.
                for (const rate of parsedRates) {
                    const [updatedRate] = await tx
                        .update(roomRates)
                        .set({
                            startDate: rate.startDate,
                            endDate: rate.endDate,
                            pricePerNight: rate.pricePerNight,
                            updatedAt: new Date(),
                        })
                        .where(
                            and(
                                eq(roomRates.id, rate.id),
                                eq(roomRates.roomTypeId, currentRoom.roomTypeId),
                            ),
                        )
                        .returning({ id: roomRates.id });

                    if (!updatedRate) throw new Error("PRICING_CHANGED");
                }
            }

            const [updatedRoom] = await tx
                .update(rooms)
                .set({
                    roomNumber: parsedRoom.data.roomNumber,
                    roomTypeId: targetRoomTypeId,
                    updatedAt: new Date(),
                })
                .where(and(eq(rooms.id, roomId), eq(rooms.hotelId, hotelId)))
                .returning({ id: rooms.id });

            if (!updatedRoom) throw new Error("ROOM_NOT_FOUND");
        });

        revalidatePath(`/admin/rooms/${hotelId}`);
        revalidatePath("/admin/rooms");
        revalidatePath("/hotels");

        return { error: null, success: true };
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "HOTEL_NOT_FOUND") {
                return { error: "Hotel not found.", success: false };
            }

            if (
                error.message === "ROOM_NOT_FOUND" ||
                error.message === "ROOM_TYPE_NOT_FOUND"
            ) {
                return {
                    error: "The room or its room type could not be found.",
                    success: false,
                };
            }

            if (error.message === "PRICING_CHANGED") {
                return {
                    error:
                        "The pricing periods changed while editing. Close this form and reopen it before saving.",
                    success: false,
                };
            }
        }

        return {
            error:
                "Unable to update the room. Check the room number, pricing periods, and dates.",
            success: false,
        };
    }
}


export type DeleteRoomState = {
    error: string | null;
    success: boolean;
};

export async function deleteRoomAction(
    _previousState: DeleteRoomState,
    formData: FormData,
): Promise<DeleteRoomState> {
    await requireAdmin();

    const hotelId = formData.get("hotelId");
    const roomId = formData.get("roomId");

    if (typeof hotelId !== "string" || !uuidRegex.test(hotelId)) {
        return { error: "Invalid hotel ID.", success: false };
    }

    if (typeof roomId !== "string" || !uuidRegex.test(roomId)) {
        return { error: "Invalid room ID.", success: false };
    }

    try {
        const [room] = await db
            .select({ id: rooms.id })
            .from(rooms)
            .where(and(eq(rooms.id, roomId), eq(rooms.hotelId, hotelId)))
            .limit(1);

        if (!room) {
            return { error: "Room not found.", success: false };
        }

        await db.delete(rooms).where(
            and(eq(rooms.id, roomId), eq(rooms.hotelId, hotelId)),
        );

        revalidatePath(`/admin/rooms/${hotelId}`);
        revalidatePath("/admin/rooms");
        revalidatePath("/hotels");

        return { error: null, success: true };
    } catch {
        return {
            error:
                "Unable to delete this room. It may be referenced by an existing booking.",
            success: false,
        };
    }
}
