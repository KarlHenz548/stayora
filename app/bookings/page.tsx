import Link from "next/link";
import { redirect } from "next/navigation";
import ButtonLink from "@/components/ui/button-link";
import { getCurrentSession } from "@/lib/auth-session";
import { getGuestBookings } from "@/lib/dal/guest-bookings";
import CancelBookingButton from "@/components/bookings/cancel-booking-button";

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

async function BookingsContent() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/sign-in?callbackURL=%2Fbookings");
  }

  const bookings = await getGuestBookings();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:px-10">
      <div className="mb-8">
        <Link
          href="/hotels"
          className="text-sm font-medium text-[#425B9A] hover:underline"
        >
          ← Browse hotels
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-[#18345C]">My Bookings</h1>

        <p className="mt-2 text-gray-500">
          View your reservations, stay dates, and payment status.
        </p>
      </div>

      {bookings.length === 0 ? (
        <section className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-[8px_8px_20px_rgba(66,91,154,0.08)]">
          <h2 className="text-xl font-semibold text-[#18345C]">
            No bookings yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your reservations will appear here after you book a stay.
          </p>

          <ButtonLink href="/hotels" className="mt-6">
            Explore hotels
          </ButtonLink>
        </section>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[8px_8px_20px_rgba(66,91,154,0.08)] sm:p-8"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <p className="text-sm text-gray-500">Booking reference</p>

                  <h2 className="mt-1 break-all font-semibold text-[#425B9A]">
                    {booking.id}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Booked on {booking.createdAt.toLocaleDateString("en-PH")}
                  </p>
                </div>

                <div className="flex flex-wrap content-start gap-2">
                  <span className="rounded-full bg-[#FFF6DC] px-3 py-1 text-sm font-medium text-[#18345C]">
                    {formatStatus(booking.status)}
                  </span>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                    Payment: {formatStatus(booking.paymentStatus)}
                  </span>
                </div>
              </div>

              <div className="my-6 grid gap-4 rounded-2xl bg-[#F8FAFF] p-5 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">Check-in</p>
                  <p className="mt-1 font-semibold text-[#18345C]">
                    {formatDate(booking.checkIn)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Check-out</p>
                  <p className="mt-1 font-semibold text-[#18345C]">
                    {formatDate(booking.checkOut)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total price</p>
                  <p className="mt-1 font-semibold text-[#18345C]">
                    {Number(booking.totalPrice).toLocaleString("en-PH", {
                      style: "currency",
                      currency: "PHP",
                    })}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[#18345C]">Reserved rooms</h3>

                {booking.rooms.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-500">
                    Room details are unavailable.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {booking.rooms.map((room) => (
                      <li
                        key={room.id}
                        className="rounded-xl border border-gray-100 p-4"
                      >
                        <p className="font-medium text-[#18345C]">
                          {room.hotelName ?? "Hotel"} — Room {room.roomNumber}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {room.roomTypeName ?? "Room type unavailable"}
                          {room.hotelCity ? ` · ${room.hotelCity}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="text-sm font-semibold text-[#425B9A] hover:underline"
                  >
                    View booking details
                  </Link>

                  {(booking.status === "pending" ||
                    booking.status === "confirmed") && (
                    <CancelBookingButton bookingId={booking.id} />
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default function BookingsPage() {
  return <BookingsContent />;
}
