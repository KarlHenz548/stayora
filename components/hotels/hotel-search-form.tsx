"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/button";
import { authClient } from "@/lib/auth-client";

type HotelSearchFormProps = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guestCount?: number;
};

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getNextDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + 1);

  return getLocalDateString(date);
}

export default function HotelSearchForm({
  destination = "",
  checkIn = "",
  checkOut = "",
  guestCount = 1,
}: HotelSearchFormProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [today, setToday] = useState("");
  const [selectedCheckIn, setSelectedCheckIn] = useState(checkIn);
  const [selectedCheckOut, setSelectedCheckOut] = useState(checkOut);
  const [selectedGuestCount, setSelectedGuestCount] = useState(
    String(guestCount),
  );

  const initializeToday = () => {
    setToday((current) => current || getLocalDateString(new Date()));
  };

  const minimumCheckOut = selectedCheckIn
    ? getNextDate(selectedCheckIn)
    : today;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) return;

    if (!session) {
      router.push("/sign-in");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim()) {
        params.set(key, value);
      }
    }

    router.push(`/hotels?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid min-w-0 grid-cols-1 gap-4 rounded-3xl bg-white p-4 shadow-2xl sm:grid-cols-2 sm:p-5 lg:grid-cols-5 lg:items-end lg:p-6"
    >
      <div>
        <label
          htmlFor="destination"
          className="mb-2 block text-sm font-semibold text-[#425B9A]"
        >
          Destination
        </label>
        <input
          id="destination"
          name="destination"
          defaultValue={destination}
          maxLength={100}
          placeholder="Where are you going?"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#425B9A] focus:ring-2 focus:ring-[#425B9A]/20"
        />
      </div>

      <div>
        <label
          htmlFor="check-in"
          className="mb-2 block text-sm font-semibold text-[#425B9A]"
        >
          Check-in
        </label>
        <input
          id="check-in"
          name="checkIn"
          type="date"
          min={today || undefined}
          value={selectedCheckIn}
          onFocus={initializeToday}
          onChange={(event) => {
            const nextCheckIn = event.target.value;
            setSelectedCheckIn(nextCheckIn);

            if (
              selectedCheckOut &&
              nextCheckIn &&
              selectedCheckOut <= nextCheckIn
            ) {
              setSelectedCheckOut("");
            }
          }}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#425B9A] focus:ring-2 focus:ring-[#425B9A]/20"
        />
      </div>

      <div>
        <label
          htmlFor="check-out"
          className="mb-2 block text-sm font-semibold text-[#425B9A]"
        >
          Check-out
        </label>
        <input
          id="check-out"
          name="checkOut"
          type="date"
          min={minimumCheckOut || undefined}
          value={selectedCheckOut}
          onFocus={initializeToday}
          onChange={(event) => setSelectedCheckOut(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#425B9A] focus:ring-2 focus:ring-[#425B9A]/20"
        />
      </div>

      <div>
        <label
          htmlFor="guest-count"
          className="mb-2 block text-sm font-semibold text-[#425B9A]"
        >
          Guests
        </label>
        <input
          id="guest-count"
          name="guestCount"
          type="number"
          min={1}
          max={20}
          step={1}
          required
          value={selectedGuestCount}
          onChange={(event) => setSelectedGuestCount(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#425B9A] focus:ring-2 focus:ring-[#425B9A]/20"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={isPending}
        className="rounded-xl"
      >
        Search stays
      </Button>
    </form>
  );
}
