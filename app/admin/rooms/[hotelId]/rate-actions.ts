
"use server";

import { and, eq, gt, lt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hotels, roomRates, roomTypes } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { roomRateSchema } from "@/lib/validations/room-rate";

export type RoomRateFormState = {
    error: string | null;
    success: boolean;
};

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function createRoomRateAction(
    _previousState: RoomRateFormState,
    formData: FormData,
): Promise<RoomRateFormState> {
    await requireAdmin();

    const hotelId = formData.get("hotelId");

    if (typeof hotelId !== "string" || !uuidRegex.test(hotelId)) {
        return { error: "Invalid hotel ID.", success: false };
    }

    const parsed = roomRateSchema.safeParse({
        roomTypeId: formData.get("roomTypeId"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        pricePerNight: formData.get("pricePerNight"),
    });

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

        const overlappingRates = await db
            .select({ id: roomRates.id })
            .from(roomRates)
            .where(
                and(
                    eq(roomRates.roomTypeId, roomType.id),
                    lt(roomRates.startDate, parsed.data.endDate),
                    gt(roomRates.endDate, parsed.data.startDate),
                ),
            )
            .limit(1);

        if (overlappingRates.length > 0) {
            return {
                error:
                    "This date range overlaps an existing rate for this room type.",
                success: false,
            };
        }

        await db.insert(roomRates).values({
            roomTypeId: roomType.id,
            startDate: parsed.data.startDate,
            endDate: parsed.data.endDate,
            pricePerNight: parsed.data.pricePerNight.toFixed(2),
        });

        revalidatePath(`/admin/rooms/${hotelId}`);
        revalidatePath("/hotels");

        return { error: null, success: true };
    } catch {
        return {
            error: "Unable to create room rate. Please try again.",
            success: false,
        };
    }
}

export async function updateRoomRateAction(
    _previousState: RoomRateFormState,
    formData: FormData,
): Promise<RoomRateFormState> {
    await requireAdmin();

    const hotelId = formData.get("hotelId");
    const roomRateId = formData.get("roomRateId");

    if (typeof hotelId !== "string" || !uuidRegex.test(hotelId)) {
        return { error: "Invalid hotel ID.", success: false };
    }

    if (typeof roomRateId !== "string" || !uuidRegex.test(roomRateId)) {
        return { error: "Invalid room rate ID.", success: false };
    }

    const parsed = roomRateSchema.safeParse({
        roomTypeId: formData.get("roomTypeId"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        pricePerNight: formData.get("pricePerNight"),
    });

    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Please check your inputs.",
            success: false,
        };
    }

    try {
        const [existingRate] = await db
            .select({ id: roomRates.id })
            .from(roomRates)
            .innerJoin(roomTypes, eq(roomRates.roomTypeId, roomTypes.id))
            .where(
                and(
                    eq(roomRates.id, roomRateId),
                    eq(roomTypes.hotelId, hotelId),
                ),
            )
            .limit(1);

        if (!existingRate) {
            return {
                error: "Room rate not found for this hotel.",
                success: false,
            };
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

        const overlappingRates = await db
            .select({ id: roomRates.id })
            .from(roomRates)
            .where(
                and(
                    eq(roomRates.roomTypeId, roomType.id),
                    ne(roomRates.id, roomRateId),
                    lt(roomRates.startDate, parsed.data.endDate),
                    gt(roomRates.endDate, parsed.data.startDate),
                ),
            )
            .limit(1);

        if (overlappingRates.length > 0) {
            return {
                error:
                    "This date range overlaps an existing rate for this room type.",
                success: false,
            };
        }

        await db
            .update(roomRates)
            .set({
                roomTypeId: roomType.id,
                startDate: parsed.data.startDate,
                endDate: parsed.data.endDate,
                pricePerNight: parsed.data.pricePerNight.toFixed(2),
                updatedAt: new Date(),
            })
            .where(eq(roomRates.id, roomRateId));

        revalidatePath(`/admin/rooms/${hotelId}`);
        revalidatePath(`/admin/rooms/${hotelId}/rates/${roomRateId}/edit`);
        revalidatePath("/hotels");

        return { error: null, success: true };
    } catch {
        return {
            error: "Unable to update room rate. Please try again.",
            success: false,
        };
    }
}
