
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hotels, roomRates, rooms, roomTypes } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { roomRateSchema } from "@/lib/validations/room-rate";
import { roomSchema } from "@/lib/validations/room";
import { roomTypeSchema } from "@/lib/validations/room-type";

export type UnifiedRoomFormState = {
    error: string | null;
    success: boolean;
};

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function createUnifiedRoomAction(
    _previousState: UnifiedRoomFormState,
    formData: FormData,
): Promise<UnifiedRoomFormState> {
    await requireAdmin();

    const hotelId = formData.get("hotelId");

    if (typeof hotelId !== "string" || !uuidRegex.test(hotelId)) {
        return { error: "Invalid hotel ID.", success: false };
    }

    const parsedRoom = roomSchema.safeParse({
        roomNumber: formData.get("roomNumber"),
        roomTypeId: "00000000-0000-4000-8000-000000000000",
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

    const parsedRate = roomRateSchema.safeParse({
        roomTypeId: "00000000-0000-4000-8000-000000000000",
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        pricePerNight: formData.get("pricePerNight"),
    });

    if (!parsedRate.success) {
        return {
            error:
                parsedRate.error.issues[0]?.message ??
                "Please check the pricing details.",
            success: false,
        };
    }

    try {
        await db.transaction(async (tx) => {
            const [hotel] = await tx
                .select({ id: hotels.id })
                .from(hotels)
                .where(eq(hotels.id, hotelId))
                .limit(1);

            if (!hotel) {
                throw new Error("HOTEL_NOT_FOUND");
            }

            const [createdRoomType] = await tx
                .insert(roomTypes)
                .values({
                    hotelId,
                    ...parsedRoomType.data,
                })
                .returning({ id: roomTypes.id });

            await tx.insert(rooms).values({
                hotelId,
                roomTypeId: createdRoomType.id,
                roomNumber: parsedRoom.data.roomNumber,
            });

            await tx.insert(roomRates).values({
                roomTypeId: createdRoomType.id,
                startDate: parsedRate.data.startDate,
                endDate: parsedRate.data.endDate,
                pricePerNight: parsedRate.data.pricePerNight.toFixed(2),
            });
        });

        revalidatePath("/admin/rooms");
        revalidatePath(`/admin/rooms/${hotelId}`);
        revalidatePath("/hotels");

        return { error: null, success: true };
    } catch (error) {
        if (error instanceof Error && error.message === "HOTEL_NOT_FOUND") {
            return { error: "Hotel not found.", success: false };
        }

        return {
            error:
                "Unable to create the room. The room number may already exist, or the pricing details may be invalid.",
            success: false,
        };
    }
}
