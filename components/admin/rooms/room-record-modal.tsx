"use client";

import { useActionState, useEffect } from "react";
import {
  updateRoomAction,
  type RoomFormState,
} from "@/app/admin/rooms/[hotelId]/room-actions";
import {
  createUnifiedRoomAction,
  type UnifiedRoomFormState,
} from "@/app/admin/rooms/[hotelId]/unified-room-actions";

export type RoomRecordType = "roomType" | "roomRate" | "room";

type RoomType = {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  bedConfiguration: string;
};

type Room = {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName: string;
};

type RoomRate = {
  id: string;
  roomTypeId: string;
  roomTypeName: string;
  startDate: string;
  endDate: string;
  pricePerNight: string;
};

type Props = {
  hotelId: string;
  mode: "create" | "edit";
  recordType: RoomRecordType;
  roomTypes: RoomType[];
  rooms: Room[];
  roomRates: RoomRate[];
  recordId: string | null;
  onRecordTypeChange: (type: RoomRecordType) => void;
  onClose: () => void;
  onSuccess: () => void;
};

const initialState: RoomFormState & UnifiedRoomFormState = {
  error: null,
  success: false,
};

const inputClassName =
  "w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#425B9A] focus:ring-2 focus:ring-blue-100";

const labelClassName = "mb-2 block text-sm font-medium text-gray-700";

function FormFeedback({
  error,
  success,
}: {
  error: string | null;
  success: boolean;
}) {
  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="text-sm text-green-700">
          Room saved successfully.
        </p>
      )}
    </>
  );
}

export default function RoomRecordModal({
  hotelId,
  mode,
  roomTypes,
  rooms,
  roomRates,
  recordId,
  onClose,
  onSuccess,
}: Props) {
  const isCreating = mode === "create";

  const [state, formAction, pending] = useActionState(
    isCreating ? createUnifiedRoomAction : updateRoomAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const room = isCreating
    ? undefined
    : rooms.find((item) => item.id === recordId);

  const roomType = room
    ? roomTypes.find((item) => item.id === room.roomTypeId)
    : undefined;

  const ratesForRoom = room
    ? roomRates
        .filter((rate) => rate.roomTypeId === room.roomTypeId)
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="room-modal-title"
              className="text-xl font-bold text-[#26334D]"
            >
              {isCreating ? "Add Room" : "Edit Room"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {isCreating
                ? "Enter the room details and its initial nightly rate."
                : "Update all room details and existing pricing periods."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6 6 18"
              />
            </svg>
          </button>
        </div>

        {!isCreating && !room ? (
          <p className="text-sm text-red-600">Room not found.</p>
        ) : !isCreating && !roomType ? (
          <p className="text-sm text-red-600">
            The room type details could not be found.
          </p>
        ) : (
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="hotelId" value={hotelId} />

            {!isCreating && (
              <input type="hidden" name="roomId" value={recordId ?? ""} />
            )}

            <div>
              <h3 className="mb-4 font-semibold text-[#26334D]">
                Room Details
              </h3>

              <div className="space-y-5">
                <div>
                  <label htmlFor="roomNumber" className={labelClassName}>
                    Room Number
                  </label>
                  <input
                    id="roomNumber"
                    name="roomNumber"
                    required
                    minLength={1}
                    maxLength={30}
                    pattern="[a-zA-Z0-9-]+"
                    defaultValue={room?.roomNumber ?? ""}
                    placeholder="e.g. 301 or A-301"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="name" className={labelClassName}>
                    Room Type Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    minLength={2}
                    maxLength={120}
                    defaultValue={roomType?.name ?? ""}
                    placeholder="e.g. Family Room"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="description" className={labelClassName}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={3}
                    defaultValue={roomType?.description ?? ""}
                    placeholder="Describe the room and its amenities."
                    className={inputClassName}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="capacity" className={labelClassName}>
                      Guest Capacity
                    </label>
                    <input
                      id="capacity"
                      name="capacity"
                      type="number"
                      required
                      min={1}
                      max={20}
                      step={1}
                      defaultValue={roomType?.capacity ?? 2}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="bedConfiguration"
                      className={labelClassName}
                    >
                      Bed Configuration
                    </label>
                    <input
                      id="bedConfiguration"
                      name="bedConfiguration"
                      required
                      minLength={2}
                      maxLength={120}
                      defaultValue={roomType?.bedConfiguration ?? ""}
                      placeholder="e.g. 2 Queen Beds"
                      className={inputClassName}
                    />
                  </div>
                </div>
              </div>
            </div>

            {isCreating ? (
              <div className="border-t border-gray-200 pt-5">
                <h3 className="mb-4 font-semibold text-[#26334D]">
                  Initial Pricing
                </h3>

                <p className="mb-4 text-sm text-gray-500">
                  The end date is exclusive. A rate ending November 1 applies
                  through October 31.
                </p>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className={labelClassName}>
                      Start Date
                    </label>
                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      required
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className={labelClassName}>
                      End Date
                    </label>
                    <input
                      id="endDate"
                      name="endDate"
                      type="date"
                      required
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label htmlFor="pricePerNight" className={labelClassName}>
                    Price Per Night (PHP)
                  </label>
                  <input
                    id="pricePerNight"
                    name="pricePerNight"
                    type="number"
                    required
                    min="0.01"
                    max="99999999.99"
                    step="0.01"
                    placeholder="3000.00"
                    className={inputClassName}
                  />
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-5">
                <h3 className="mb-2 font-semibold text-[#26334D]">
                  Pricing Periods
                </h3>

                <p className="mb-4 text-sm text-gray-500">
                  Edit each existing rate. End dates are exclusive. Historical
                  booking price snapshots are not changed by these edits.
                </p>

                {ratesForRoom.length === 0 ? (
                  <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                    This room type has no existing pricing periods.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {ratesForRoom.map((rate, index) => (
                      <fieldset
                        key={rate.id}
                        className="space-y-4 rounded-xl border border-gray-200 p-4"
                      >
                        <legend className="px-2 text-sm font-semibold text-[#26334D]">
                          Rate Period {index + 1}
                        </legend>

                        <input type="hidden" name="rateId" value={rate.id} />

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor={`startDate-${rate.id}`}
                              className={labelClassName}
                            >
                              Start Date
                            </label>
                            <input
                              id={`startDate-${rate.id}`}
                              name="startDate"
                              type="date"
                              required
                              defaultValue={rate.startDate}
                              className={inputClassName}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`endDate-${rate.id}`}
                              className={labelClassName}
                            >
                              End Date
                            </label>
                            <input
                              id={`endDate-${rate.id}`}
                              name="endDate"
                              type="date"
                              required
                              defaultValue={rate.endDate}
                              className={inputClassName}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor={`pricePerNight-${rate.id}`}
                            className={labelClassName}
                          >
                            Price Per Night (PHP)
                          </label>
                          <input
                            id={`pricePerNight-${rate.id}`}
                            name="pricePerNight"
                            type="number"
                            required
                            min="0.01"
                            max="99999999.99"
                            step="0.01"
                            defaultValue={rate.pricePerNight}
                            className={inputClassName}
                          />
                        </div>
                      </fieldset>
                    ))}
                  </div>
                )}
              </div>
            )}

            <FormFeedback error={state.error} success={state.success} />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-[#425B9A] px-5 py-3 font-semibold text-white transition hover:bg-[#344879] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending
                  ? "Saving..."
                  : isCreating
                    ? "Save Room"
                    : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
