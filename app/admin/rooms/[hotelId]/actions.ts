
"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hotels, roomTypes } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { roomTypeSchema } from "@/lib/validations/room-type";

export type RoomTypeFormState = {
    error: string | null;
    success: boolean;
};

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function createRoomTypeAction(
    _previousState: RoomTypeFormState,
    formData: FormData,
): Promise<RoomTypeFormState> {
    await requireAdmin();

    const hotelId = formData.get("hotelId");

    if (typeof hotelId !== "string" || !uuidRegex.test(hotelId)) {
        return { error: "Invalid hotel ID.", success: false };
    }

    const parsed = roomTypeSchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
        capacity: formData.get("capacity"),
        bedConfiguration: formData.get("bedConfiguration"),
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

        await db.insert(roomTypes).values({
            hotelId,
            ...parsed.data,
        });

        revalidatePath("/admin/rooms");
        revalidatePath(`/admin/rooms/${hotelId}`);

        return { error: null, success: true };
    } catch {
        return {
            error: "Unable to create room type. Please try again.",
            success: false,
        };
    }
}

export async function updateRoomTypeAction(
    _previousState: RoomTypeFormState,
    formData: FormData,
): Promise<RoomTypeFormState> {
    await requireAdmin();

    const hotelId = formData.get("hotelId");
    const roomTypeId = formData.get("roomTypeId");

    if (typeof hotelId !== "string" || !uuidRegex.test(hotelId)) {
        return { error: "Invalid hotel ID.", success: false };
    }

    if (typeof roomTypeId !== "string" || !uuidRegex.test(roomTypeId)) {
        return { error: "Invalid room type ID.", success: false };
    }

    const parsed = roomTypeSchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
        capacity: formData.get("capacity"),
        bedConfiguration: formData.get("bedConfiguration"),
    });

    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Please check your inputs.",
            success: false,
        };
    }

    try {
        const [updatedRoomType] = await db
            .update(roomTypes)
            .set({
                ...parsed.data,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(roomTypes.id, roomTypeId),
                    eq(roomTypes.hotelId, hotelId),
                ),
            )
            .returning({
                id: roomTypes.id,
            });

        if (!updatedRoomType) {
            return {
                error: "Room type not found for this hotel.",
                success: false,
            };
        }

        revalidatePath("/admin/rooms");
        revalidatePath(`/admin/rooms/${hotelId}`);
        revalidatePath(
            `/admin/rooms/${hotelId}/types/${roomTypeId}/edit`,
        );

        return { error: null, success: true };
    } catch {
        return {
            error: "Unable to update room type. Please try again.",
            success: false,
        };
    }
}
