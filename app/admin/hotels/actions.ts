
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hotels } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";

type HotelStatus = "draft" | "published" | "archived";

export type HotelStatusFormState = {
    error: string | null;
    success: boolean;
};

export async function updateHotelStatusAction(
    _previousState: HotelStatusFormState,
    formData: FormData,
): Promise<HotelStatusFormState> {
    await requireAdmin();

    const hotelId = formData.get("hotelId");
    const status = formData.get("status");

    if (
        typeof hotelId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(hotelId)
    ) {
        return { error: "Invalid hotel ID.", success: false };
    }

    if (
        typeof status !== "string" ||
        !["draft", "published", "archived"].includes(status)
    ) {
        return { error: "Invalid hotel status.", success: false };
    }

    try {
        const [updatedHotel] = await db
            .update(hotels)
            .set({ status: status as HotelStatus })
            .where(eq(hotels.id, hotelId))
            .returning({ id: hotels.id });

        if (!updatedHotel) {
            return { error: "Hotel not found.", success: false };
        }

        revalidatePath("/admin");
        revalidatePath("/admin/hotels");
        revalidatePath("/hotels");

        return { error: null, success: true };
    } catch {
        return {
            error: "Unable to update hotel status. Please try again.",
            success: false,
        };
    }
}
