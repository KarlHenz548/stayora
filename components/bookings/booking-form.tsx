"use client";

import AvailabilityCalendar from "@/components/bookings/availability-calendar";
import Button from "@/components/ui/button";
import type { BookingFormProps } from "@/components/bookings/booking-form.types";

function formatStayDate(date: string) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatPrice(amount: string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export default function BookingForm({
  roomTypes,
  selectedRoomTypeId,
  onRoomTypeChange,
  checkIn,
  checkOut,
  guestCount,
  paymentMethod,
  today,
  availabilityEndDate,
  unavailableDates,
  isLoadingAvailability,
  availabilityError,
  activeDateField,
  isSubmitting,
  error,
  pricePreview,
  isLoadingPrice,
  priceError,
  onCheckInClick,
  onCheckOutClick,
  onSelectDate,
  onGuestCountChange,
  onPaymentMethodChange,
  onRetryAvailability,
  onSubmit,
}: BookingFormProps) {
  const roomType = roomTypes.find((item) => item.id === selectedRoomTypeId);

  if (!roomType) {
    return (
      <p role="alert" className="text-sm text-gray-600">
        No room type is available for booking.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="booking-room-type"
          className="mb-1 block text-sm font-medium text-[#243047]"
        >
          Room type
        </label>

        <select
          id="booking-room-type"
          value={selectedRoomTypeId}
          onChange={(event) => onRoomTypeChange(event.target.value)}
          required
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-[#243047] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A]"
        >
          {roomTypes.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name} — maximum {option.capacity} guests
            </option>
          ))}
        </select>

        <p className="mt-1 text-xs text-gray-500">Selected: {roomType.name}</p>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-[#243047]">Check-in</p>

        <button
          type="button"
          onClick={onCheckInClick}
          aria-label={`Choose check-in date${checkIn ? `, currently ${formatStayDate(checkIn)}` : ""}`}
          aria-pressed={activeDateField === "checkIn"}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-left text-sm text-[#243047] transition-colors hover:bg-[#FFF6DC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A]"
        >
          {checkIn ? formatStayDate(checkIn) : "Select check-in date"}
        </button>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-[#243047]">Check-out</p>

        <button
          type="button"
          onClick={onCheckOutClick}
          aria-label={`Choose check-out date${checkOut ? `, currently ${formatStayDate(checkOut)}` : ""}`}
          aria-pressed={activeDateField === "checkOut"}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-left text-sm text-[#243047] transition-colors hover:bg-[#FFF6DC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A]"
        >
          {checkOut ? formatStayDate(checkOut) : "Select check-out date"}
        </button>
      </div>

      {activeDateField ? (
        <AvailabilityCalendar
          activeDateField={activeDateField}
          checkIn={checkIn}
          checkOut={checkOut}
          today={today}
          availabilityEndDate={availabilityEndDate}
          unavailableDates={unavailableDates}
          isLoading={isLoadingAvailability}
          error={availabilityError}
          onSelect={onSelectDate}
        />
      ) : null}

      {availabilityError ? (
        <button
          type="button"
          onClick={onRetryAvailability}
          disabled={isLoadingAvailability}
          className="w-full rounded-xl border border-[#425B9A] px-4 py-2.5 text-sm font-semibold text-[#425B9A] transition-colors hover:bg-[#FFF6DC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoadingAvailability ? "Retrying..." : "Retry availability"}
        </button>
      ) : null}

      <div>
        <label
          htmlFor="booking-guests"
          className="mb-1 block text-sm font-medium text-[#243047]"
        >
          Guests
        </label>

        <input
          id="booking-guests"
          type="number"
          min={1}
          max={roomType.capacity}
          value={guestCount}
          onChange={(event) => onGuestCountChange(event.target.value)}
          required
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A]"
        />

        <p className="mt-1 text-xs text-gray-500">
          Maximum {roomType.capacity} guests for this room type.
        </p>
      </div>

      {checkIn && checkOut && checkOut > checkIn ? (
        <section
          aria-live="polite"
          className="rounded-2xl border border-gray-200 bg-[#FFF6DC] p-4"
        >
          <h4 className="font-semibold text-[#243047]">Price estimate</h4>

          {isLoadingPrice ? (
            <p className="mt-2 text-sm text-gray-600">
              Calculating your stay...
            </p>
          ) : priceError ? (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {priceError}
            </p>
          ) : pricePreview ? (
            <>
              <div className="mt-3 space-y-2">
                {pricePreview.nightlyRates.map((rate) => (
                  <div
                    key={rate.stayDate}
                    className="flex justify-between gap-4 text-sm text-gray-700"
                  >
                    <span>{formatStayDate(rate.stayDate)}</span>
                    <span>{formatPrice(rate.pricePerNight)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-between border-t border-gray-300 pt-3 text-sm text-gray-700">
                <span>{pricePreview.nights} night(s)</span>
                <span className="font-semibold">
                  {formatPrice(pricePreview.totalPrice)}
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Estimate only. The final price and room availability are
                confirmed when your booking is processed.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              Preparing your price estimate...
            </p>
          )}
        </section>
      ) : null}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-[#243047]">
          Payment method
        </legend>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="radio"
            name="booking-payment"
            value="pay_at_hotel"
            checked={paymentMethod === "pay_at_hotel"}
            onChange={() => onPaymentMethodChange("pay_at_hotel")}
            className="accent-[#425B9A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A]"
          />
          Pay at hotel
        </label>

        <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="radio"
            name="booking-payment"
            value="online"
            disabled
            checked={paymentMethod === "online"}
            onChange={() => onPaymentMethodChange("online")}
            className="accent-[#425B9A]"
          />
          Online payment (checkout coming soon)
        </label>
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        fullWidth
        disabled={
          isSubmitting ||
          isLoadingAvailability ||
          !!availabilityError ||
          isLoadingPrice ||
          !pricePreview ||
          !!priceError
        }
      >
        {isSubmitting ? "Creating booking..." : "Book this room"}
      </Button>
    </form>
  );
}
