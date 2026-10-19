export type RatePeriod = {
    startDate: string;
    endDate: string;
    pricePerNight: string;
};

export type NightlyRate = {
    stayDate: string;
    pricePerNight: string;
};

type StayDates = {
    checkIn: string;
    checkOut: string;
};

export function calculateNightlyRates(
    stay: StayDates,
    rates: RatePeriod[],
): NightlyRate[] | null {
    const nightlyRates: NightlyRate[] = [];

    for (let date = stay.checkIn; date < stay.checkOut;) {
        const rate = rates.find(
            (item) =>
                item.startDate <= date &&
                item.endDate > date,
        );

        if (!rate) {
            return null;
        }

        nightlyRates.push({
            stayDate: date,
            pricePerNight: rate.pricePerNight,
        });

        const nextDate = new Date(`${date}T00:00:00.000Z`);
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);
        date = nextDate.toISOString().slice(0, 10);
    }

    return nightlyRates;
}