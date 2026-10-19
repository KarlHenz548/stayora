
import { NextResponse } from "next/server";
import { z } from "zod";
import { getUnavailableRoomDates } from "@/lib/dal/booking-availability";

const availabilityQuerySchema = z
    .object({
        roomTypeId: z.uuid(),
        guestCount: z.coerce.number().int().positive().max(20),
        startDate: z.iso.date(),
        endDate: z.iso.date(),
    })
    .refine((data) => data.endDate > data.startDate, {
        message: "End date must be after start date.",
        path: ["endDate"],
    })
    .refine(
        (data) =>
            (Date.parse(`${data.endDate}T00:00:00Z`) -
                Date.parse(`${data.startDate}T00:00:00Z`)) /
            86_400_000 <=
            93,
        {
            message: "Date range cannot exceed 93 days.",
            path: ["endDate"],
        },
    );

export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;

    const parsed = availabilityQuerySchema.safeParse({
        roomTypeId: searchParams.get("roomTypeId"),
        guestCount: searchParams.get("guestCount"),
        startDate: searchParams.get("startDate"),
        endDate: searchParams.get("endDate"),
    });

    if (!parsed.success) {
        return NextResponse.json(
            { message: "Invalid availability query.", errors: parsed.error.issues },
            { status: 400 },
        );
    }

    try {
        const unavailableDates = await getUnavailableRoomDates(
            parsed.data,
        );

        return NextResponse.json({ unavailableDates });
    } catch {
        return NextResponse.json(
            { message: "Unable to check room availability." },
            { status: 500 },
        );
    }
}
