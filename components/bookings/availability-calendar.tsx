"use client";

import { useState } from "react";

type AvailabilityCalendarProps = {
  activeDateField: "checkIn" | "checkOut";
  checkIn: string;
  checkOut: string;
  today: string;
  availabilityEndDate: string;
  unavailableDates: string[];
  isLoading: boolean;
  error: string;
  onSelect: (date: string) => void;
};

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AvailabilityCalendar({
  activeDateField,
  checkIn,
  checkOut,
  today,
  availabilityEndDate,
  unavailableDates,
  isLoading,
  error,
  onSelect,
}: AvailabilityCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date(`${today}T00:00:00`);
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const firstAvailableMonth = new Date(
    Number(today.slice(0, 4)),
    Number(today.slice(5, 7)) - 1,
    1,
  );

  const lastAvailableMonth = new Date(
    Number(availabilityEndDate.slice(0, 4)),
    Number(availabilityEndDate.slice(5, 7)) - 1,
    1,
  );

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(year, month, index + 1);

    return {
      date: toDateString(date),
      day: index + 1,
    };
  });

  function isDisabled(date: string) {
    if (isLoading || date < today || date > availabilityEndDate) {
      return true;
    }

    if (activeDateField === "checkIn") {
      return date >= availabilityEndDate || unavailableDates.includes(date);
    }

    if (!checkIn || date <= checkIn) {
      return true;
    }

    const nights =
      (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) /
      86_400_000;

    if (nights > 30) {
      return true;
    }

    // Check every night, excluding the checkout date itself.
    for (let offset = 0; offset < nights; offset++) {
      const night = new Date(`${checkIn}T00:00:00Z`);
      night.setUTCDate(night.getUTCDate() + offset);

      const nightDate = night.toISOString().slice(0, 10);

      if (unavailableDates.includes(nightDate)) {
        return true;
      }
    }

    return false;
  }

  function goToPreviousMonth() {
    const previousMonth = new Date(year, month - 1, 1);

    if (previousMonth >= firstAvailableMonth) {
      setVisibleMonth(previousMonth);
    }
  }

  function goToNextMonth() {
    const nextMonth = new Date(year, month + 1, 1);

    if (nextMonth <= lastAvailableMonth) {
      setVisibleMonth(nextMonth);
    }
  }

  const previousMonthDisabled =
    isLoading || error !== "" || visibleMonth <= firstAvailableMonth;

  const nextMonthDisabled =
    isLoading || error !== "" || visibleMonth >= lastAvailableMonth;

  return (
    <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goToPreviousMonth}
          disabled={previousMonthDisabled}
          aria-label="Previous month"
          className="rounded-xl px-3 py-2 text-[#425B9A] transition-colors hover:bg-[#FFF6DC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A] disabled:cursor-not-allowed disabled:opacity-30"
        >
          &larr;
        </button>

        <h3
          aria-live="polite"
          className="text-center text-sm font-bold text-[#243047] sm:text-base"
        >
          {visibleMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        <button
          type="button"
          onClick={goToNextMonth}
          disabled={nextMonthDisabled}
          aria-label="Next month"
          className="rounded-xl px-3 py-2 text-[#425B9A] transition-colors hover:bg-[#FFF6DC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A] disabled:cursor-not-allowed disabled:opacity-30"
        >
          &rarr;
        </button>
      </div>

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-40 items-center justify-center rounded-xl bg-[#FFF6DC] px-4 py-8 text-center text-sm text-[#243047]"
        >
          Checking room availability...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-5 text-sm leading-6 text-red-700"
        >
          {error}
        </div>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs"
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (weekday) => (
                <span key={weekday} className="py-2">
                  {weekday}
                </span>
              ),
            )}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstWeekday }, (_, index) => (
              <span key={`blank-${index}`} aria-hidden="true" />
            ))}

            {days.map(({ date, day }) => {
              const disabled = isDisabled(date);
              const selected = date === checkIn || date === checkOut;

              return (
                <button
                  key={date}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(date)}
                  aria-label={`${date}${date === checkIn ? ", check-in" : ""}${date === checkOut ? ", check-out" : ""}${disabled ? ", not selectable" : ""}`}
                  aria-pressed={selected}
                  className={`aspect-square rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A] ${
                    selected
                      ? "bg-[#425B9A] font-semibold text-white"
                      : "hover:bg-[#FFF6DC]"
                  } ${
                    disabled
                      ? "cursor-not-allowed text-gray-300 line-through"
                      : "text-[#243047]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Selecting: {activeDateField === "checkIn" ? "Check-in" : "Check-out"}
      </p>
    </div>
  );
}
