"use server";

import { ZodError } from "zod";
import { createBooking } from "@/lib/services/booking-service";
import { cancelBooking } from "@/lib/services/booking-cancellation-service";

export async function createBookingAction(input: unknown) {
    try {
        const booking = await createBooking(input);

        return {
            success: true as const,
            bookingId: booking.bookingId,
            totalPrice: booking.totalPrice,
        };
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                success: false as const,
                message: "Please check your booking details.",
            };
        }

        if (error instanceof Error && error.message.startsWith("Unauthorized:")) {
            return {
                success: false as const,
                code: "UNAUTHORIZED" as const,
                message: "Please sign in before booking.",
            };
        }

        if (
            error instanceof Error &&
            error.message ===
            "No rates available for the selected dates."
        ) {
            return {
                success: false as const,
                message: "No rates are available for those dates.",
            };
        }

        if (
            error instanceof Error &&
            error.message ===
            "No room is available for the selected dates."
        ) {
            return {
                success: false as const,
                message: "No room is available for those dates.",
            };
        }

        if (
            error instanceof Error &&
            error.message.startsWith("This room was just booked.")
        ) {
            return {
                success: false as const,
                message: error.message,
            };
        }

        return {
            success: false as const,
            message: "Unable to create your booking. Please try again.",
        };
    }
}


export async function cancelBookingAction(bookingId: string) {
    try {
        const result = await cancelBooking(bookingId);

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
                message: "Please sign in to cancel your booking.",
            };
        }

        if (
            error instanceof Error &&
            error.message.startsWith("Booking not found")
        ) {
            return {
                success: false as const,
                message: "Booking not found or you do not have permission to cancel it.",
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

        if (
            error instanceof Error &&
            error.message.startsWith(
                "Bookings can only be cancelled",
            )
        ) {
            return {
                success: false as const,
                message: error.message,
            };
        }

        return {
            success: false as const,
            message: "Unable to cancel your booking. Please try again.",
        };
    }
}
