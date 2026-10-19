
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";

import { hotels, roomRates, rooms, roomTypes } from "@/lib/db/schema";

export async function getHotelsForRoomManagement() {
    return db
        .select({
            id: hotels.id,
            name: hotels.name,
            city: hotels.city,
            country: hotels.country,
            status: hotels.status,
        })
        .from(hotels)
        .orderBy(asc(hotels.name));
}

export async function getHotelRoomTypes(hotelId: string) {
    return db
        .select({
            id: roomTypes.id,
            name: roomTypes.name,
            description: roomTypes.description,
            capacity: roomTypes.capacity,
            bedConfiguration: roomTypes.bedConfiguration,
        })
        .from(roomTypes)
        .where(eq(roomTypes.hotelId, hotelId))
        .orderBy(asc(roomTypes.name));
}

export async function getHotelRooms(hotelId: string) {
    return db
        .select({
            id: rooms.id,
            roomNumber: rooms.roomNumber,
            roomTypeId: rooms.roomTypeId,
            roomTypeName: roomTypes.name,
        })
        .from(rooms)
        .innerJoin(roomTypes, eq(rooms.roomTypeId, roomTypes.id))
        .where(eq(rooms.hotelId, hotelId))
        .orderBy(asc(roomTypes.name), asc(rooms.roomNumber));
}

export async function getHotelRoomRates(hotelId: string) {
    return db
        .select({
            id: roomRates.id,
            roomTypeId: roomRates.roomTypeId,
            roomTypeName: roomTypes.name,
            startDate: roomRates.startDate,
            endDate: roomRates.endDate,
            pricePerNight: roomRates.pricePerNight,
        })
        .from(roomRates)
        .innerJoin(roomTypes, eq(roomRates.roomTypeId, roomTypes.id))
        .where(eq(roomTypes.hotelId, hotelId))
        .orderBy(asc(roomTypes.name), asc(roomRates.startDate));
}