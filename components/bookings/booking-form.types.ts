
import type { FormEvent } from "react";

export type BookingRoomType = {
    id: string;
    name: string;
    capacity: number;
};

export type PricePreview = {
    nights: number;
    nightlyRates: {
        stayDate: string;
        pricePerNight: string;
    }[];
    totalPrice: string;
};

export type BookingFormProps = {
    roomTypes: BookingRoomType[];
    selectedRoomTypeId: string;
    onRoomTypeChange: (roomTypeId: string) => void;
    checkIn: string;
    checkOut: string;
    guestCount: string;
    paymentMethod: "pay_at_hotel" | "online";

    today: string;
    availabilityEndDate: string;
    unavailableDates: string[];
    isLoadingAvailability: boolean;
    availabilityError: string;
    activeDateField: "checkIn" | "checkOut" | null;
    isSubmitting: boolean;
    error: string;

    pricePreview: PricePreview | null;
    isLoadingPrice: boolean;
    priceError: string;

    onCheckInClick: () => void;
    onCheckOutClick: () => void;
    onSelectDate: (date: string) => void;
    onGuestCountChange: (value: string) => void;
    onPaymentMethodChange: (value: "pay_at_hotel" | "online") => void;
    onRetryAvailability: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};
