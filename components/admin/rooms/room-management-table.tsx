"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoomRecordModal, {
  type RoomRecordType,
} from "@/components/admin/rooms/room-record-modal";
import {
  deleteRoomAction,
  type DeleteRoomState,
} from "@/app/admin/rooms/[hotelId]/room-actions";

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
  roomTypes: RoomType[];
  rooms: Room[];
  roomRates: RoomRate[];
};

const initialDeleteState: DeleteRoomState = {
  error: null,
  success: false,
};

function formatPrice(price: string) {
  return `₱${Number(price).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function DeleteRoomDialog({
  hotelId,
  room,
  onClose,
  onSuccess,
}: {
  hotelId: string;
  room: Room;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    deleteRoomAction,
    initialDeleteState,
  );

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#243047]/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-room-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.3 3.86 1.82 18.5A2 2 0 0 0 3.55 21h16.9a2 2 0 0 0 1.73-2.5L13.7 3.86a2 2 0 0 0-3.4 0Z"
            />
          </svg>
        </div>

        <h2
          id="delete-room-title"
          className="text-lg font-bold text-[#243047]"
        >
          Delete Room {room.roomNumber}?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Are you sure you want to delete this room? This action cannot be
          undone. Rooms referenced by existing bookings cannot be deleted.
        </p>

        {state.error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}

        <form action={formAction} className="mt-6 flex justify-end gap-3">
          <input type="hidden" name="hotelId" value={hotelId} />
          <input type="hidden" name="roomId" value={room.id} />

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Deleting...
              </>
            ) : (
              "Delete Room"
            )}
          </button>
        </form>
      </section>
    </div>
  );
}

export default function RoomManagementTable({
  hotelId,
  roomTypes,
  rooms,
  roomRates,
}: Props) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [recordType, setRecordType] = useState<RoomRecordType>("room");
  const [recordId, setRecordId] = useState<string | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  function openCreateModal() {
    setMode("create");
    setRecordType("room");
    setRecordId(null);
    setIsModalOpen(true);
  }

  function openEditModal(type: RoomRecordType, id: string) {
    setMode("edit");
    setRecordType(type);
    setRecordId(id);
    setIsModalOpen(true);
  }

  function handleSaveSuccess() {
    setIsModalOpen(false);
    router.refresh();
  }

  function handleDeleteSuccess() {
    setRoomToDelete(null);
    router.refresh();
  }

  const roomRows = rooms.map((room) => {
    const roomType = roomTypes.find((item) => item.id === room.roomTypeId);

    const rates = roomRates.filter(
      (rate) => rate.roomTypeId === room.roomTypeId,
    );

    return {
      ...room,
      description: roomType?.description ?? "—",
      capacity: roomType?.capacity ?? null,
      bedConfiguration: roomType?.bedConfiguration ?? "—",
      rates,
    };
  });

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          {roomRows.length} {roomRows.length === 1 ? "room" : "rooms"}
        </p>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#425B9A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#344879]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 5v14M5 12h14"
            />
          </svg>
          Add Room
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-275 text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-[#F5F7FB] text-gray-500">
              <th className="px-4 py-3 font-medium">Room No.</th>
              <th className="px-4 py-3 font-medium">Room Type</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Capacity</th>
              <th className="px-4 py-3 font-medium">Bed Configuration</th>
              <th className="px-4 py-3 font-medium">Price / Night</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {roomRows.map((room) => (
              <tr key={room.id} className="transition hover:bg-gray-50">
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {room.roomNumber}
                </td>

                <td className="px-4 py-4">
                  <span className="inline-flex rounded-full bg-[#F5F7FB] px-3 py-1 text-xs font-medium text-[#425B9A]">
                    {room.roomTypeName}
                  </span>
                </td>

                <td className="max-w-64 px-4 py-4 text-gray-600">
                  {room.description}
                </td>

                <td className="px-4 py-4 text-gray-600">
                  {room.capacity ?? "—"} guests
                </td>

                <td className="px-4 py-4 text-gray-600">
                  {room.bedConfiguration}
                </td>

                <td className="px-4 py-4">
                  {room.rates.length > 0 ? (
                    <div className="min-w-52 space-y-2">
                      {room.rates.map((rate) => (
                        <div key={rate.id}>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(rate.pricePerNight)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {rate.startDate} – {rate.endDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">No rates configured</span>
                  )}
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal("room", room.id)}
                      aria-label={`Edit room ${room.roomNumber}`}
                      title="Edit room"
                      className="inline-flex rounded-lg border border-gray-200 p-2 text-[#425B9A] transition hover:bg-[#F5F7FB]"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 2.651 2.651M4 20l4.5-1 10.6-10.6a1.875 1.875 0 0 0-2.65-2.65L5.85 16.35 4 20Z"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRoomToDelete(room)}
                      aria-label={`Delete room ${room.roomNumber}`}
                      title="Delete room"
                      className="inline-flex rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {roomRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <p className="font-semibold text-gray-900">
                    No individual rooms yet
                  </p>
                  <p className="mt-2 text-gray-500">
                    Use Add Room to create your first room.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <RoomRecordModal
          key={`${mode}-${recordType}-${recordId ?? "new"}`}
          hotelId={hotelId}
          mode={mode}
          recordType={recordType}
          roomTypes={roomTypes}
          rooms={rooms}
          roomRates={roomRates}
          recordId={recordId}
          onRecordTypeChange={setRecordType}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSaveSuccess}
        />
      )}

      {roomToDelete && (
        <DeleteRoomDialog
          key={roomToDelete.id}
          hotelId={hotelId}
          room={roomToDelete}
          onClose={() => setRoomToDelete(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}