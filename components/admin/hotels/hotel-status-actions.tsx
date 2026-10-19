"use client";

import { useActionState } from "react";
import {
  updateHotelStatusAction,
  type HotelStatusFormState,
} from "@/app/admin/hotels/actions";

type HotelStatus = "draft" | "published" | "archived";

type HotelStatusActionsProps = {
  hotelId: string;
  status: HotelStatus;
};

const initialState: HotelStatusFormState = {
  error: null,
  success: false,
};

export default function HotelStatusActions({
  hotelId,
  status,
}: HotelStatusActionsProps) {
  const [state, formAction, isPending] = useActionState(
    updateHotelStatusAction,
    initialState,
  );

  const nextStatus: HotelStatus =
    status === "published"
      ? "archived"
      : status === "archived"
        ? "draft"
        : "published";

  const buttonLabel: Record<HotelStatus, string> = {
    draft: "Publish",
    published: "Archive",
    archived: "Restore to draft",
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <form action={formAction}>
        <input type="hidden" name="hotelId" value={hotelId} />
        <input type="hidden" name="status" value={nextStatus} />

        <button
          type="submit"
          disabled={isPending}
          className="text-sm font-medium text-[#425B9A] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Updating..." : buttonLabel[status]}
        </button>
      </form>

      {state.error && (
        <p role="alert" className="max-w-48 text-xs text-red-600">
          {state.error}
        </p>
      )}

      {state.success && (
        <p role="status" className="text-xs text-green-700">
          Status updated.
        </p>
      )}
    </div>
  );
}
