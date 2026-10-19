
export function toCents(price: string): number {
    const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(price);

    if (!match) {
        throw new Error("Invalid nightly rate.");
    }

    const cents =
        Number(match[1]) * 100 +
        Number((match[2] ?? "").padEnd(2, "0"));

    if (!Number.isSafeInteger(cents)) {
        throw new Error("Invalid nightly rate.");
    }

    return cents;
}

export function formatCents(cents: number): string {
    if (!Number.isSafeInteger(cents) || cents < 0) {
        throw new Error("Invalid cents amount.");
    }

    const whole = Math.floor(cents / 100);
    const fraction = String(cents % 100).padStart(2, "0");

    return `${whole}.${fraction}`;
}
