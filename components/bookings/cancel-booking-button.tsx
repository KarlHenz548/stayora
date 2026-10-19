"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import { cancelBookingAction } from "@/app/bookings/actions";

type CancelBookingButtonProps = {
  bookingId: string;
};

export default function CancelBookingButton({
  bookingId,
}: CancelBookingButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking? Cancellations must be made at least 24 hours before check-in.",
    );

    if (!confirmed) return;

    setError(null);

    startTransition(async () => {
      const result = await cancelBookingAction(bookingId);

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="mt-3">
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={handleCancel}
      >
        {isPending ? "Cancelling..." : "Cancel booking"}
      </Button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
