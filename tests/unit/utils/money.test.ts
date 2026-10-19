
import { describe, expect, it } from "vitest";
import { formatCents, toCents } from "../../../lib/utils/money";

describe("toCents", () => {
    it("converts whole pesos to cents", () => {
        expect(toCents("2000")).toBe(200000);
    });

    it("converts decimal prices to cents", () => {
        expect(toCents("2000.5")).toBe(200050);
        expect(toCents("2000.50")).toBe(200050);
    });

    it("rejects prices with more than two decimal places", () => {
        expect(() => toCents("2000.555")).toThrow(
            "Invalid nightly rate.",
        );
    });
    it("rejects invalid price formats", () => {
        expect(() => toCents("-100.00")).toThrow(
            "Invalid nightly rate.",
        );

        expect(() => toCents("1e3")).toThrow(
            "Invalid nightly rate.",
        );
    });
});


describe("formatCents", () => {
    it("formats cents as a two-decimal price", () => {
        expect(formatCents(200000)).toBe("2000.00");
        expect(formatCents(200050)).toBe("2000.50");
        expect(formatCents(5)).toBe("0.05");
    });

    it("rejects negative or non-integer cents", () => {
        expect(() => formatCents(-100)).toThrow(
            "Invalid cents amount.",
        );

        expect(() => formatCents(10.5)).toThrow(
            "Invalid cents amount.",
        );
    });

    it("rejects prices beyond the safe integer limit", () => {
        expect(() => toCents("90071992547410.00")).toThrow(
            "Invalid nightly rate.",
        );
    });

});
