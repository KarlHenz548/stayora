import { describe, expect, it } from "vitest";
import { calculateNightlyRates } from "../../../lib/utils/booking-rates";

const rates = [
    {
        startDate: "2026-11-01",
        endDate: "2026-11-03",
        pricePerNight: "2000.00",
    },
    {
        startDate: "2026-11-03",
        endDate: "2026-11-06",
        pricePerNight: "2500.00",
    },
];

describe("calculateNightlyRates", () => {
    it("returns the correct rate for each night", () => {
        expect(
            calculateNightlyRates(
                {
                    checkIn: "2026-11-01",
                    checkOut: "2026-11-05",
                },
                rates,
            ),
        ).toEqual([
            { stayDate: "2026-11-01", pricePerNight: "2000.00" },
            { stayDate: "2026-11-02", pricePerNight: "2000.00" },
            { stayDate: "2026-11-03", pricePerNight: "2500.00" },
            { stayDate: "2026-11-04", pricePerNight: "2500.00" },
        ]);
    });

    it("returns null when a night has no rate", () => {
        expect(
            calculateNightlyRates(
                {
                    checkIn: "2026-11-01",
                    checkOut: "2026-11-07",
                },
                rates,
            ),
        ).toBeNull();
    });

    it("does not include the checkout date", () => {
        expect(
            calculateNightlyRates(
                {
                    checkIn: "2026-11-01",
                    checkOut: "2026-11-02",
                },
                rates,
            ),
        ).toEqual([
            { stayDate: "2026-11-01", pricePerNight: "2000.00" },
        ]);
    });
});
