"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import { adminCancelBookingAction } from "@/app/admin/bookings/actions";

type AdminCancelBookingButtonProps = {
  bookingId: string;
};

export default function AdminCancelBookingButton({
  bookingId,
}: AdminCancelBookingButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking as an administrator?",
    );

    if (!confirmed) return;

    setError(null);

    startTransition(async () => {
      const result = await adminCancelBookingAction(bookingId);

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
        size="sm"
        disabled={isPending}
        onClick={handleCancel}
      >
        {isPending ? "Cancelling..." : "Cancel booking"}
      </Button>

      {error && (
        <p role="alert" className="mt-2 max-w-48 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
