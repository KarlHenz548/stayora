import HotelCard from "@/components/hotels/hotel-card";
import ButtonLink from "@/components/ui/button-link";

type FeaturedHotel = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  imageUrl: string | null;
};

type HomeFeaturedHotelsProps = {
  hotels: FeaturedHotel[];
};

export default function HomeFeaturedHotels({
  hotels,
}: HomeFeaturedHotelsProps) {
  return (
    <section className="bg-white px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#425B9A]">
          Handpicked for you
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Featured stays
        </h2>

        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Discover comfortable places for your next getaway.
        </p>

        {hotels.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                slug={hotel.slug}
                name={hotel.name}
                location={`${hotel.city}, ${hotel.country}`}
                image={hotel.imageUrl ?? "/images/room.jpg"}
              />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-slate-600">
            No featured stays are available yet.
          </p>
        )}

        <div className="mt-10 flex justify-center">
          <ButtonLink
            href="/sign-in?callbackURL=%2Fhotels"
            variant="primary"
            size="lg"
          >
            View all hotels
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
