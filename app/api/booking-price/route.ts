import { NextResponse } from "next/server";
import { z } from "zod";

import { getNightlyRates } from "@/lib/dal/booking-rates";
import { formatCents, toCents } from "@/lib/utils/money";

const bookingPriceQuerySchema = z
    .object({
        roomTypeId: z.uuid(),
        checkIn: z.iso.date(),
        checkOut: z.iso.date(),
        guestCount: z.coerce.number().int().positive().max(20),
    })
    .refine((data) => data.checkOut > data.checkIn, {
        message: "Check-out must be after check-in.",
        path: ["checkOut"],
    })
    .refine(
        (data) =>
            (Date.parse(`${data.checkOut}T00:00:00Z`) -
                Date.parse(`${data.checkIn}T00:00:00Z`)) /
            86_400_000 <=
            30,
        {
            message: "A booking cannot exceed 30 nights.",
            path: ["checkOut"],
        },
    );

export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;

    const parsed = bookingPriceQuerySchema.safeParse({
        roomTypeId: searchParams.get("roomTypeId"),
        checkIn: searchParams.get("checkIn"),
        checkOut: searchParams.get("checkOut"),
        guestCount: searchParams.get("guestCount"),
    });

    if (!parsed.success) {
        return NextResponse.json(
            {
                message: "Invalid price preview request.",
                errors: parsed.error.issues,
            },
            { status: 400 },
        );
    }

    try {
        const { roomTypeId, checkIn, checkOut } = parsed.data;

        const nightlyRates = await getNightlyRates({
            roomTypeId,
            checkIn,
            checkOut,
        });

        if (!nightlyRates) {
            return NextResponse.json(
                { message: "No rates are available for the selected dates." },
                { status: 404 },
            );
        }

        const totalCents = nightlyRates.reduce(
            (total, rate) => total + toCents(rate.pricePerNight),
            0,
        );

        if (!Number.isSafeInteger(totalCents) || totalCents <= 0) {
            throw new Error("Invalid booking total.");
        }

        return NextResponse.json({
            nights: nightlyRates.length,
            nightlyRates: nightlyRates.map((rate) => ({
                stayDate: rate.stayDate,
                pricePerNight: rate.pricePerNight,
            })),
            totalPrice: formatCents(totalCents),
        });
    } catch {
        return NextResponse.json(
            { message: "Unable to calculate the price preview." },
            { status: 500 },
        );
    }
}