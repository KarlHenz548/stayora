import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ButtonLink from "@/components/ui/button-link";
import CancelBookingButton from "@/components/bookings/cancel-booking-button";
import { getCurrentSession } from "@/lib/auth-session";
import { getGuestBookingById } from "@/lib/dal/guest-bookings";

type BookingDetailsPageProps = {
  params: Promise<{ bookingId: string }>;
};

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(price: string | number) {
  return pesoFormatter.format(Number(price));
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getNightCount(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T00:00:00.000Z`);
  const end = new Date(`${checkOut}T00:00:00.000Z`);

  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatusClasses(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

export default function BookingDetailsPage({
  params,
}: BookingDetailsPageProps) {
  return <BookingDetails params={params} />;
}


async function BookingDetails({ params }: BookingDetailsPageProps) {
  const { bookingId } = await params;
  const session = await getCurrentSession();

  if (!session) {
    redirect(
      `/sign-in?callbackURL=${encodeURIComponent(`/bookings/${bookingId}`)}`,
    );
  }

  const booking = await getGuestBookingById(bookingId);

  if (!booking) {
    notFound();
  }

  const nightCount = getNightCount(booking.checkIn, booking.checkOut);

  return (
    <main className="min-h-screen bg-[#FFF6DC] px-5 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/bookings"
          className="text-sm font-semibold text-[#425B9A] hover:underline"
        >
          &larr; Back to my bookings
        </Link>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#425B9A]">
                Booking confirmation
              </p>

              <h1 className="mt-2 text-3xl font-bold text-[#243047]">
                Your booking details
              </h1>

              <p className="mt-3 text-sm text-gray-500">Booking reference</p>

              <p className="mt-1 break-all font-mono text-sm text-[#243047]">
                {booking.id}
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(
                booking.status,
              )}`}
            >
              {formatLabel(booking.status)}
            </span>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-[#243047]">
              Your accommodation
            </h2>

            {booking.rooms.length === 0 ? (
              <p className="mt-4 text-sm text-gray-600">
                Room assignment details are not currently available.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {booking.rooms.map((room, index) => (
                  <article
                    key={room.id}
                    className="rounded-2xl border border-gray-100 p-4 sm:p-5"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-[#425B9A]">
                      Reserved room {index + 1}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-[#243047]">
                      {room.hotelName ?? "Hotel"}
                    </h3>

                    {room.hotelCity ? (
                      <p className="mt-1 text-sm text-gray-600">
                        {room.hotelCity}
                      </p>
                    ) : null}

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-[#FFF6DC] p-4">
                        <p className="text-sm text-gray-600">Room type</p>
                        <p className="mt-1 font-semibold text-[#243047]">
                          {room.roomTypeName ?? "Room type unavailable"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#FFF6DC] p-4">
                        <p className="text-sm text-gray-600">Assigned room</p>
                        <p className="mt-1 font-semibold text-[#243047]">
                          {room.roomNumber}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-[#243047]">
              Stay details
            </h2>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Check-in</p>
                <p className="mt-1 font-semibold text-[#243047]">
                  {formatDate(booking.checkIn)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Check-out</p>
                <p className="mt-1 font-semibold text-[#243047]">
                  {formatDate(booking.checkOut)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Length of stay</p>
                <p className="mt-1 font-semibold text-[#243047]">
                  {nightCount} {nightCount === 1 ? "night" : "nights"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Booking date</p>
                <p className="mt-1 font-semibold text-[#243047]">
                  {booking.createdAt.toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-[#243047]">
              Price breakdown
            </h2>

            {booking.rooms.some((room) => room.nightlyRates.length > 0) ? (
              <div className="mt-4 space-y-5">
                {booking.rooms.map((room) => (
                  <section
                    key={room.id}
                    className="rounded-2xl border border-gray-100 p-4 sm:p-5"
                  >
                    <h3 className="font-semibold text-[#243047]">
                      Room {room.roomNumber}
                      {room.hotelName ? ` · ${room.hotelName}` : ""}
                    </h3>

                    {room.nightlyRates.length === 0 ? (
                      <p className="mt-3 text-sm text-gray-500">
                        Nightly price details are unavailable for this room.
                      </p>
                    ) : (
                      <div className="mt-3 divide-y divide-gray-100">
                        {room.nightlyRates.map((night) => (
                          <div
                            key={night.stayDate}
                            className="flex items-center justify-between gap-4 py-3"
                          >
                            <div>
                              <p className="font-medium text-[#243047]">
                                {formatDate(night.stayDate)}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                1 night
                              </p>
                            </div>

                            <p className="shrink-0 font-medium text-[#243047]">
                              {formatPrice(night.pricePerNight)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                Nightly price details are unavailable for this booking.
              </p>
            )}

            <div className="mt-5 rounded-2xl bg-[#FFF6DC] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total booking price</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {nightCount} {nightCount === 1 ? "night" : "nights"}
                    {booking.rooms.length > 1
                      ? ` · ${booking.rooms.length} rooms`
                      : ""}
                  </p>
                </div>

                <p className="text-right text-xl font-bold text-[#243047] sm:text-2xl">
                  {formatPrice(booking.totalPrice)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-[#243047]">
              Payment details
            </h2>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Payment method</p>
                <p className="mt-1 font-semibold text-[#243047]">
                  {formatLabel(booking.paymentMethod)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Payment status</p>
                <p className="mt-1 font-semibold text-[#243047]">
                  {formatLabel(booking.paymentStatus)}
                </p>
              </div>
            </div>

            {booking.paymentMethod === "online" &&
            booking.paymentStatus === "pending" ? (
              <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Online checkout is not available yet. This booking has not been
                paid and may expire after 15 minutes.
              </p>
            ) : null}

            {booking.paymentMethod === "pay_at_hotel" &&
            booking.paymentStatus === "pending" ? (
              <p className="mt-5 rounded-xl bg-[#FFF6DC] p-4 text-sm text-gray-700">
                Payment is pending. Pay at the hotel according to its payment
                policy.
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href="/bookings">View all my bookings</ButtonLink>

            {booking.status === "pending" || booking.status === "confirmed" ? (
              <CancelBookingButton bookingId={booking.id} />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
