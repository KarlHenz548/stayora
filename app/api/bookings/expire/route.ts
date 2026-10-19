
import { expirePendingBookings } from "@/lib/services/booking-expiration-service";

export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    const authorization = request.headers.get("authorization");

    if (!secret || authorization !== `Bearer ${secret}`) {
        return Response.json(
            { success: false, message: "Unauthorized" },
            { status: 401 },
        );
    }

    try {
        const result = await expirePendingBookings();

        return Response.json({
            success: true,
            expiredCount: result.expiredCount,
        });
    } catch {
        return Response.json(
            {
                success: false,
                message: "Booking cleanup failed.",
            },
            { status: 500 },
        );
    }
}
