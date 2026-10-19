
"use server";

import { adminCancelBooking } from "@/lib/services/admin-booking-service";

export async function adminCancelBookingAction(bookingId: string) {
    try {
        const result = await adminCancelBooking(bookingId);

        return {
            success: true as const,
            bookingId: result.bookingId,
        };
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.startsWith("Unauthorized:")
        ) {
            return {
                success: false as const,
                message: "You are not authorized to manage bookings.",
            };
        }

        if (
            error instanceof Error &&
            error.message === "Booking not found."
        ) {
            return {
                success: false as const,
                message: "Booking not found.",
            };
        }

        if (
            error instanceof Error &&
            error.message ===
            "This booking can no longer be cancelled."
        ) {
            return {
                success: false as const,
                message: error.message,
            };
        }

        return {
            success: false as const,
            message: "Unable to cancel this booking. Please try again.",
        };
    }
}
