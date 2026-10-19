"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBookingAction } from "@/app/bookings/actions";
import BookingForm from "@/components/bookings/booking-form";

import type {
  BookingRoomType,
  PricePreview,
} from "@/components/bookings/booking-form.types";

type BookingFormControllerProps = {
  roomTypes: BookingRoomType[];
};

type PriceRequestState =
  | {
      key: string;
      status: "loading";
    }
  | {
      key: string;
      status: "success";
      data: PricePreview;
    }
  | {
      key: string;
      status: "error";
      message: string;
    };

function getLocalDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getAvailabilityEndDate(today: string) {
  const endDate = new Date(`${today}T00:00:00`);
  endDate.setDate(endDate.getDate() + 93);

  const year = endDate.getFullYear();
  const month = String(endDate.getMonth() + 1).padStart(2, "0");
  const day = String(endDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isPricePreview(value: unknown): value is PricePreview {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.nights === "number" &&
    Number.isInteger(data.nights) &&
    data.nights > 0 &&
    typeof data.totalPrice === "string" &&
    /^\d+(?:\.\d{1,2})?$/.test(data.totalPrice) &&
    Array.isArray(data.nightlyRates) &&
    data.nightlyRates.length === data.nights &&
    data.nightlyRates.every(
      (rate: unknown) =>
        typeof rate === "object" &&
        rate !== null &&
        "stayDate" in rate &&
        typeof rate.stayDate === "string" &&
        "pricePerNight" in rate &&
        typeof rate.pricePerNight === "string" &&
        /^\d+(?:\.\d{1,2})?$/.test(rate.pricePerNight),
    )
  );
}

function getResponseMessage(data: unknown, fallback: string) {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallback;
}

export default function BookingFormController({
  roomTypes,
}: BookingFormControllerProps) {
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(
    roomTypes[0]?.id ?? "",
  );

  const roomType = roomTypes.find((item) => item.id === selectedRoomTypeId);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState<"pay_at_hotel" | "online">(
    "pay_at_hotel",
  );

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityRetryCount, setAvailabilityRetryCount] = useState(0);

  const [activeDateField, setActiveDateField] = useState<
    "checkIn" | "checkOut" | null
  >(null);

  const [priceRequest, setPriceRequest] = useState<PriceRequestState | null>(
    null,
  );

  const today = getLocalDateString();
  const availabilityEndDate = getAvailabilityEndDate(today);
  const router = useRouter();

  const priceRequestKey =
    roomType && checkIn && checkOut && checkOut > checkIn
      ? new URLSearchParams({
          roomTypeId: roomType.id,
          checkIn,
          checkOut,
          guestCount,
        }).toString()
      : "";

  const currentPriceRequest =
    priceRequest?.key === priceRequestKey ? priceRequest : null;

  const pricePreview =
    currentPriceRequest?.status === "success" ? currentPriceRequest.data : null;

  const isLoadingPrice = currentPriceRequest?.status === "loading";

  const priceError =
    currentPriceRequest?.status === "error" ? currentPriceRequest.message : "";

  useEffect(() => {
    if (!roomType) {
      return;
    }

    const selectedRoomType = roomType;
    const startDate = getLocalDateString();
    const controller = new AbortController();

    async function loadAvailability() {
      setIsLoadingAvailability(true);
      setAvailabilityError("");

      try {
        const params = new URLSearchParams({
          roomTypeId: selectedRoomType.id,
          guestCount,
          startDate,
          endDate: availabilityEndDate,
        });

        const response = await fetch(
          `/api/room-availability?${params.toString()}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Availability request failed.");
        }

        const data: unknown = await response.json();

        if (
          typeof data !== "object" ||
          data === null ||
          !("unavailableDates" in data) ||
          !Array.isArray(data.unavailableDates) ||
          !data.unavailableDates.every(
            (date: unknown) => typeof date === "string",
          )
        ) {
          throw new Error("Invalid availability response.");
        }

        if (!controller.signal.aborted) {
          setUnavailableDates(data.unavailableDates);
        }
      } catch {
        if (!controller.signal.aborted) {
          setUnavailableDates([]);
          setAvailabilityError(
            "Unable to load room availability. Please try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingAvailability(false);
        }
      }
    }

    loadAvailability();

    return () => controller.abort();
  }, [roomType, guestCount, availabilityRetryCount, availabilityEndDate]);

  useEffect(() => {
    if (!priceRequestKey) {
      return;
    }

    const controller = new AbortController();

    async function loadPricePreview() {
      setPriceRequest({
        key: priceRequestKey,
        status: "loading",
      });

      try {
        const response = await fetch(`/api/booking-price?${priceRequestKey}`, {
          signal: controller.signal,
        });

        const data: unknown = await response.json();

        if (!response.ok) {
          throw new Error(
            getResponseMessage(data, "Unable to calculate the price estimate."),
          );
        }

        if (!isPricePreview(data)) {
          throw new Error("The price estimate response is invalid.");
        }

        if (!controller.signal.aborted) {
          setPriceRequest({
            key: priceRequestKey,
            status: "success",
            data,
          });
        }
      } catch (caughtError) {
        if (!controller.signal.aborted) {
          setPriceRequest({
            key: priceRequestKey,
            status: "error",
            message:
              caughtError instanceof Error
                ? caughtError.message
                : "Unable to calculate the price estimate.",
          });
        }
      }
    }

    loadPricePreview();

    return () => controller.abort();
  }, [priceRequestKey]);

  function handleRoomTypeChange(roomTypeId: string) {
    const nextRoomType = roomTypes.find((item) => item.id === roomTypeId);

    if (!nextRoomType) {
      return;
    }

    setSelectedRoomTypeId(nextRoomType.id);
    setGuestCount((current) =>
      Number(current) > nextRoomType.capacity ? "1" : current,
    );
    setUnavailableDates([]);
    setAvailabilityError("");
    setPriceRequest(null);
    setError("");
  }

  function handleDateSelect(date: string) {
    setError("");

    if (activeDateField === "checkIn") {
      setCheckIn(date);
      setCheckOut("");
      setActiveDateField("checkOut");
      return;
    }

    if (activeDateField === "checkOut") {
      setCheckOut(date);
      setActiveDateField(null);
    }
  }

  function handleCheckInClick() {
    setError("");
    setActiveDateField("checkIn");
  }

  function handleCheckOutClick() {
    if (!checkIn) {
      setError("Please select your check-in date first.");
      setActiveDateField("checkIn");
      return;
    }

    setError("");
    setActiveDateField("checkOut");
  }

  function handleGuestCountChange(value: string) {
    setGuestCount(value);
    setError("");
  }

  function handleRetryAvailability() {
    setError("");
    setAvailabilityRetryCount((count) => count + 1);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!roomType) {
      setError("Please select an available room type.");
      return;
    }

    if (isLoadingAvailability || availabilityError) {
      setError("Please wait until room availability has loaded successfully.");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Please select your check-in and check-out dates.");
      return;
    }

    if (checkIn < today) {
      setError("Check-in cannot be in the past.");
      return;
    }

    if (checkIn > availabilityEndDate || checkOut > availabilityEndDate) {
      setError("Please select dates within the available booking period.");
      return;
    }

    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    const guests = Number(guestCount);

    if (!Number.isInteger(guests) || guests < 1 || guests > roomType.capacity) {
      setError(`Please select between 1 and ${roomType.capacity} guests.`);
      return;
    }

    const nights =
      (Date.parse(`${checkOut}T00:00:00Z`) -
        Date.parse(`${checkIn}T00:00:00Z`)) /
      86_400_000;

    if (nights > 30) {
      setError("A booking cannot exceed 30 nights.");
      return;
    }

    for (let offset = 0; offset < nights; offset++) {
      const night = new Date(`${checkIn}T00:00:00Z`);
      night.setUTCDate(night.getUTCDate() + offset);

      if (unavailableDates.includes(night.toISOString().slice(0, 10))) {
        setError(
          "This date range includes an unavailable night. Please select new dates.",
        );
        return;
      }
    }

    if (isLoadingPrice || !pricePreview || priceError) {
      setError("Please wait until the current price estimate is available.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createBookingAction({
        roomTypeId: roomType.id,
        checkIn,
        checkOut,
        guestCount: guests,
        paymentMethod,
      });

      if (!response.success) {
        if ("code" in response && response.code === "UNAUTHORIZED") {
          const callbackURL = window.location.pathname + window.location.search;

          router.push(
            `/sign-in?callbackURL=${encodeURIComponent(callbackURL)}`,
          );
          return;
        }

        setError(response.message);
        return;
      }

      router.push(`/bookings/${response.bookingId}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!roomTypes.length || !roomType) {
    return (
      <p className="text-sm text-gray-600">
        No room types are currently available for booking.
      </p>
    );
  }

  return (
    <BookingForm
      roomTypes={roomTypes}
      selectedRoomTypeId={selectedRoomTypeId}
      onRoomTypeChange={handleRoomTypeChange}
      checkIn={checkIn}
      checkOut={checkOut}
      guestCount={guestCount}
      paymentMethod={paymentMethod}
      today={today}
      availabilityEndDate={availabilityEndDate}
      unavailableDates={unavailableDates}
      isLoadingAvailability={isLoadingAvailability}
      availabilityError={availabilityError}
      activeDateField={activeDateField}
      isSubmitting={isSubmitting}
      error={error}
      pricePreview={pricePreview}
      isLoadingPrice={isLoadingPrice}
      priceError={priceError}
      onCheckInClick={handleCheckInClick}
      onCheckOutClick={handleCheckOutClick}
      onSelectDate={handleDateSelect}
      onGuestCountChange={handleGuestCountChange}
      onPaymentMethodChange={setPaymentMethod}
      onRetryAvailability={handleRetryAvailability}
      onSubmit={handleSubmit}
    />
  );
}
