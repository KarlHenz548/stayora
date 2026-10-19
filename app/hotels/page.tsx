import CustomerSidebar from "@/components/layout/customer-sidebar";
import HotelCard from "@/components/hotels/hotel-card";
import HotelList from "@/components/hotels/hotel-list";
import HotelSearchForm from "@/components/hotels/hotel-search-form";
import HotelsPage from "@/components/hotels/hotels-page";
import {
  getHotelsAvailableForStay,
  getPublishedHotels,
} from "@/lib/dal/public-hotels";
import { hotelSearchSchema } from "@/lib/validations/hotel-search";
import { connection } from "next/server";

type HotelsPageProps = {
  searchParams: Promise<{
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guestCount?: string;
  }>;
};

export default function Page({ searchParams }: HotelsPageProps) {
  return <HotelsContent searchParams={searchParams} />;
}

async function HotelsContent({ searchParams }: HotelsPageProps) {
  await connection();
  const [rawSearchParams, hotels] = await Promise.all([
    searchParams,
    getPublishedHotels(),
  ]);

  const parsedSearch = hotelSearchSchema.safeParse(rawSearchParams);

  const search = parsedSearch.success
    ? parsedSearch.data
    : {
        destination: rawSearchParams.destination ?? "",
        checkIn: rawSearchParams.checkIn ?? "",
        checkOut: rawSearchParams.checkOut ?? "",
        guestCount: 1,
      };

  const searchError = parsedSearch.success
    ? null
    : (parsedSearch.error.issues[0]?.message ??
      "Please check your search filters.");

  const searchDestination = (search.destination ?? "").trim().toLowerCase();

  let availableHotelIds: Set<string> | null = null;

  if (!searchError && search.checkIn && search.checkOut) {
    availableHotelIds = await getHotelsAvailableForStay({
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      guestCount: search.guestCount,
    });
  }

  const filteredHotels = hotels.filter((hotel) => {
    const searchableText =
      `${hotel.name} ${hotel.city} ${hotel.country}`.toLowerCase();

    const matchesDestination = searchableText.includes(searchDestination);

    const matchesAvailability =
      availableHotelIds === null || availableHotelIds.has(hotel.id);

    return matchesDestination && matchesAvailability;
  });

  let emptyTitle = "No hotels found";
  let emptyMessage = "Try searching for a different destination.";

  if (search.checkIn && search.checkOut) {
    emptyTitle = "No available stays found";
    emptyMessage =
      "Try different dates or reduce the number of guests to find an available room.";
  } else if (searchDestination) {
    emptyTitle = "No hotels match your destination";
    emptyMessage =
      "Check your spelling or try searching for a city or country.";
  } else if (hotels.length === 0) {
    emptyTitle = "No hotels available yet";
    emptyMessage = "Please check back later for available stays.";
  }

  return (
    <div className="min-h-screen bg-[#FFF6DC] md:pl-72">
      <CustomerSidebar />

      <main className="min-w-0 pt-16 md:pt-0">
        <HotelsPage />

        <section className="bg-[#FFF6DC] px-5 pb-10 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <HotelSearchForm
              destination={search.destination ?? ""}
              checkIn={search.checkIn ?? ""}
              checkOut={search.checkOut ?? ""}
              guestCount={search.guestCount}
            />

            {searchError ? (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {searchError}
              </p>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-screen-2xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
          <HotelList
            hasHotels={filteredHotels.length > 0}
            emptyTitle={emptyTitle}
            emptyMessage={emptyMessage}
          >
            {filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                slug={hotel.slug}
                name={hotel.name}
                location={`${hotel.city}, ${hotel.country}`}
                image={hotel.imageUrl ?? "/images/room.jpg"}
              />
            ))}
          </HotelList>
        </section>
      </main>
    </div>
  );
}
