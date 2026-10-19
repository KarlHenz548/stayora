import "server-only";

import { and, asc, eq, gte } from "drizzle-orm";

import { findAvailableRoom } from "@/lib/dal/booking-availability";
import { getNightlyRates } from "@/lib/dal/booking-rates";
import { db } from "@/lib/db";
import { hotels, hotelImages, roomTypes } from "@/lib/db/schema";

export async function getPublishedHotels() {
    return db
        .select({
            id: hotels.id,
            name: hotels.name,
            slug: hotels.slug,
            description: hotels.description,
            city: hotels.city,
            country: hotels.country,
            imageUrl: hotelImages.imageUrl,
            imageAlt: hotelImages.altText,
        })
        .from(hotels)
        .leftJoin(
            hotelImages,
            and(
                eq(hotels.id, hotelImages.hotelId),
                eq(hotelImages.isPrimary, true),
            ),
        )
        .where(eq(hotels.status, "published"))
        .orderBy(asc(hotels.name));
}

export async function getPublishedHotelBySlug(slug: string) {
    const result = await db
        .select({
            id: hotels.id,
            name: hotels.name,
            slug: hotels.slug,
            description: hotels.description,
            address: hotels.address,
            city: hotels.city,
            country: hotels.country,
            imageUrl: hotelImages.imageUrl,
            imageAlt: hotelImages.altText,
        })
        .from(hotels)
        .leftJoin(
            hotelImages,
            and(
                eq(hotels.id, hotelImages.hotelId),
                eq(hotelImages.isPrimary, true),
            ),
        )
        .where(
            and(
                eq(hotels.slug, slug),
                eq(hotels.status, "published"),
            ),
        )
        .limit(1);

    return result[0] ?? null;
}

export async function getPublishedHotelRoomTypes(hotelId: string) {
    return db
        .select({
            id: roomTypes.id,
            name: roomTypes.name,
            description: roomTypes.description,
            capacity: roomTypes.capacity,
            bedConfiguration: roomTypes.bedConfiguration,
        })
        .from(roomTypes)
        .innerJoin(hotels, eq(roomTypes.hotelId, hotels.id))
        .where(
            and(
                eq(roomTypes.hotelId, hotelId),
                eq(hotels.status, "published"),
            ),
        )
        .orderBy(asc(roomTypes.name));
}

type HotelStaySearch = {
    checkIn: string;
    checkOut: string;
    guestCount: number;
};

export async function getHotelsAvailableForStay(
    input: HotelStaySearch,
): Promise<Set<string>> {
    if (
        !Number.isInteger(input.guestCount) ||
        input.guestCount < 1 ||
        input.checkIn >= input.checkOut
    ) {
        return new Set();
    }

    const eligibleRoomTypes = await db
        .select({
            id: roomTypes.id,
            hotelId: roomTypes.hotelId,
        })
        .from(roomTypes)
        .innerJoin(hotels, eq(roomTypes.hotelId, hotels.id))
        .where(
            and(
                eq(hotels.status, "published"),
                gte(roomTypes.capacity, input.guestCount),
            ),
        );

    const results = await Promise.all(
        eligibleRoomTypes.map(async (roomType) => {
            const [availableRoomId, nightlyRates] = await Promise.all([
                findAvailableRoom({
                    roomTypeId: roomType.id,
                    checkIn: input.checkIn,
                    checkOut: input.checkOut,
                    guestCount: input.guestCount,
                }),
                getNightlyRates({
                    roomTypeId: roomType.id,
                    checkIn: input.checkIn,
                    checkOut: input.checkOut,
                }),
            ]);

            return availableRoomId && nightlyRates
                ? roomType.hotelId
                : null;
        }),
    );

    return new Set(
        results.filter((hotelId): hotelId is string => hotelId !== null),
    );
}