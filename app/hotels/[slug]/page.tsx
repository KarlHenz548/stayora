import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublishedHotelBySlug,
  getPublishedHotelRoomTypes,
} from "@/lib/dal/public-hotels";
import BookingFormController from "@/components/bookings/booking-form-controller";

type HotelDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function HotelDetailsPage({
  params,
}: HotelDetailsPageProps) {
  const { slug } = await params;

  const hotel = await getPublishedHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  const roomTypes = await getPublishedHotelRoomTypes(hotel.id);

  return (
    <main className="min-h-screen bg-[#FFF6DC] px-5 py-8 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/hotels"
          className="text-sm font-semibold text-[#425B9A] hover:underline"
        >
          &larr; Back to hotels
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          {hotel.imageUrl ? (
            <div className="relative h-64 w-full sm:h-96">
              <Image
                src={hotel.imageUrl}
                alt={hotel.imageAlt ?? hotel.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="p-6 sm:p-10">
            <p className="text-sm font-medium text-[#425B9A]">
              {hotel.city}, {hotel.country}
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#243047] sm:text-4xl">
              {hotel.name}
            </h1>

            {hotel.address ? (
              <p className="mt-3 text-sm text-gray-600">{hotel.address}</p>
            ) : null}

            {hotel.description ? (
              <p className="mt-5 max-w-3xl leading-7 text-gray-700">
                {hotel.description}
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#425B9A]">
              Find your stay
            </p>

            <h2 className="mt-2 text-2xl font-bold text-[#243047]">
              Available room types
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Explore the available rooms, then choose your preferred room type
              in the booking form below.
            </p>
          </div>

          {roomTypes.length === 0 ? (
            <p className="mt-5 rounded-2xl bg-white p-6 text-gray-600 shadow-sm">
              No room types are currently available at this hotel.
            </p>
          ) : (
            <>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {roomTypes.map((roomType) => (
                  <article
                    key={roomType.id}
                    className="flex flex-col rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-[#243047]">
                        {roomType.name}
                      </h3>

                      {roomType.description ? (
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          {roomType.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                      <p>
                        <span className="font-medium text-[#243047]">
                          Capacity:
                        </span>{" "}
                        {roomType.capacity} guests
                      </p>

                      <p>
                        <span className="font-medium text-[#243047]">
                          Beds:
                        </span>{" "}
                        {roomType.bedConfiguration}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <section
                id="booking-form"
                className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#425B9A]">
                    Reserve your stay
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-[#243047]">
                    Book your room
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Choose a room type, select your dates, and enter your guest
                    details to see the price estimate.
                  </p>
                </div>

                <BookingFormController
                  roomTypes={roomTypes.map((roomType) => ({
                    id: roomType.id,
                    name: roomType.name,
                    capacity: roomType.capacity,
                  }))}
                />
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
