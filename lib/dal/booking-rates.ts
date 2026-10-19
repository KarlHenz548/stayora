
import "server-only";

import { and, eq, gt, lt } from "drizzle-orm";

import { db } from "@/lib/db";
import type { DbTransaction } from "@/lib/db";
import { roomRates } from "@/lib/db/schema/rooms/room-rates";
import {
    calculateNightlyRates,
    type NightlyRate,
} from "@/lib/utils/booking-rates";

export type { NightlyRate } from "@/lib/utils/booking-rates";

type RateInput = {
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
};

export async function getNightlyRates(
    input: RateInput,
    executor: typeof db | DbTransaction = db,
): Promise<NightlyRate[] | null> {
    const rates = await executor
        .select({
            startDate: roomRates.startDate,
            endDate: roomRates.endDate,
            pricePerNight: roomRates.pricePerNight,
        })
        .from(roomRates)
        .where(
            and(
                eq(roomRates.roomTypeId, input.roomTypeId),
                lt(roomRates.startDate, input.checkOut),
                gt(roomRates.endDate, input.checkIn),
            ),
        );

    return calculateNightlyRates(input, rates);
}
