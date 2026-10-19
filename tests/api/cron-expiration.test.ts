
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

const { expirePendingBookings } = vi.hoisted(() => ({
    expirePendingBookings: vi.fn(),
}));

vi.mock("@/lib/services/booking-expiration-service", () => ({
    expirePendingBookings,
}));
import { GET } from "../../app/api/bookings/expire/route";

describe("GET /api/bookings/expire", () => {
    beforeEach(() => {
        vi.stubEnv("CRON_SECRET", "test-secret");
        expirePendingBookings.mockReset();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("returns 401 when the secret is missing", async () => {
        vi.stubEnv("CRON_SECRET", "");

        const response = await GET(
            new Request("http://localhost/api/bookings/expire"),
        );

        expect(response.status).toBe(401);
        expect(expirePendingBookings).not.toHaveBeenCalled();
    });

    it("returns 401 when the token is incorrect", async () => {
        const request = new Request(
            "http://localhost/api/bookings/expire",
            {
                headers: { authorization: "Bearer wrong-secret" },
            },
        );

        const response = await GET(request);

        expect(response.status).toBe(401);
        expect(expirePendingBookings).not.toHaveBeenCalled();
    });

    it("returns the expiration count when authorized", async () => {
        expirePendingBookings.mockResolvedValue({ expiredCount: 3 });

        const request = new Request(
            "http://localhost/api/bookings/expire",
            {
                headers: { authorization: "Bearer test-secret" },
            },
        );

        const response = await GET(request);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            success: true,
            expiredCount: 3,
        });
        expect(expirePendingBookings).toHaveBeenCalledOnce();
    });

    it("returns 500 when cleanup fails", async () => {
        expirePendingBookings.mockRejectedValue(
            new Error("Simulated cleanup failure"),
        );

        const request = new Request(
            "http://localhost/api/bookings/expire",
            {
                headers: { authorization: "Bearer test-secret" },
            },
        );

        const response = await GET(request);

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({
            success: false,
            message: "Booking cleanup failed.",
        });
    });
});
