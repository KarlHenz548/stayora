import Link from "next/link";

import { getAdminBookings } from "@/lib/dal/admin-bookings";
import AdminCancelBookingButton from "@/components/admin/bookings/cancel-booking-button";

export const instant = false;

const bookingStatuses = [
  "all",
  "pending",
  "confirmed",
  "cancelled",
  "completed",
] as const;

type BookingFilter = (typeof bookingStatuses)[number];

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(price: string) {
  return Number(price).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
}

function getStatusStyles(status: string) {
  switch (status) {
    case "confirmed":
    case "paid":
      return "bg-green-100 text-green-800";

    case "pending":
      return "bg-amber-100 text-amber-800";

    case "cancelled":
    case "failed":
      return "bg-red-100 text-red-800";

    case "completed":
      return "bg-blue-100 text-blue-800";

    case "refunded":
      return "bg-purple-100 text-purple-800";

    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string | string[];
  }>;
}) {
  const [allBookings, params] = await Promise.all([
    getAdminBookings(),
    searchParams,
  ]);

  const requestedStatus = params.status;

  const activeStatus: BookingFilter =
    typeof requestedStatus === "string" &&
    bookingStatuses.includes(requestedStatus as BookingFilter)
      ? (requestedStatus as BookingFilter)
      : "all";

  const bookings =
    activeStatus === "all"
      ? allBookings
      : allBookings.filter((booking) => booking.status === activeStatus);

  return (
    <section>
      <div>
        <p className="text-sm font-medium text-[#425B9A]">Booking management</p>

        <h1 className="mt-2 text-2xl font-bold">Bookings</h1>

        <p className="mt-2 text-sm text-gray-500">
          View guest reservations and payment information.
        </p>
      </div>

      <nav
        aria-label="Filter bookings by status"
        className="mt-6 flex flex-wrap gap-2"
      >
        {bookingStatuses.map((status) => {
          const isActive = activeStatus === status;

          return (
            <Link
              key={status}
              href={
                status === "all"
                  ? "/admin/bookings"
                  : `/admin/bookings?status=${status}`
              }
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-[#425B9A] text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {formatStatus(status)}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {bookings.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-lg font-semibold">
              {activeStatus === "all"
                ? "No bookings yet"
                : `No ${activeStatus} bookings`}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {activeStatus === "all"
                ? "Guest reservations will appear here."
                : "Try another status filter to see more bookings."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-250 text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Booking / Guest</th>
                  <th className="px-6 py-4 font-medium">Hotel / Room</th>
                  <th className="px-6 py-4 font-medium">Stay</th>
                  <th className="px-6 py-4 font-medium">Booking status</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="align-top transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#26334D]">
                        {booking.id}
                      </p>

                      <p className="mt-1">{booking.guestName}</p>

                      <p className="mt-1 text-xs text-gray-500">
                        {booking.guestEmail}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      {booking.rooms.length === 0 ? (
                        <p className="text-gray-500">
                          Room details unavailable
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {booking.rooms.map((room) => (
                            <div key={room.id}>
                              <p className="font-medium">
                                {room.hotelName ?? "Hotel unavailable"}
                              </p>

                              <p className="mt-1 text-gray-500">
                                {room.roomTypeName ?? "Room type unavailable"}
                                {" · "}Room {room.roomNumber}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      <p>{formatDate(booking.checkIn)}</p>
                      <p className="mt-1">to {formatDate(booking.checkOut)}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(booking.status)}`}
                      >
                        {formatStatus(booking.status)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(booking.paymentStatus)}`}
                      >
                        {formatStatus(booking.paymentStatus)}
                      </span>

                      <p className="mt-2 text-xs text-gray-500">
                        {booking.paymentMethod === "pay_at_hotel"
                          ? "Pay at hotel"
                          : "Online"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 font-semibold">
                      {formatPrice(booking.totalPrice)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {new Intl.DateTimeFormat("en-PH", {
                        dateStyle: "medium",
                      }).format(booking.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      {(booking.status === "pending" ||
                        booking.status === "confirmed") && (
                        <AdminCancelBookingButton bookingId={booking.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
        {activeStatus === "all" ? " total" : ` with ${activeStatus} status`}
      </p>
    </section>
  );
}
