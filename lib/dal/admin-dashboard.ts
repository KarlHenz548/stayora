
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, hotels, rooms } from "@/lib/db/schema";

export async function getAdminDashboardStats() {
  const [
    [hotelResult],
    [roomResult],
    [bookingResult],
    [pendingBookingResult],
  ] = await Promise.all([
    db.select({ total: count() }).from(hotels),
    db.select({ total: count() }).from(rooms),
    db.select({ total: count() }).from(bookings),
    db
      .select({ total: count() })
      .from(bookings)
      .where(eq(bookings.status, "pending")),
  ]);

  return {
    totalHotels: hotelResult.total,
    totalRooms: roomResult.total,
    totalBookings: bookingResult.total,
    pendingBookings: pendingBookingResult.total,
  };
}
