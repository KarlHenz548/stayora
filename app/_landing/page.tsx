import { Suspense } from "react";

import Navbar from "@/components/layout/navbar";
import HomeHero from "@/components/home/home-hero";
import HomeAbout from "@/components/home/home-about";
import HomeServices from "@/components/home/home-services";
import HomeFeaturedHotels from "@/components/home/home-featured-hotels";
import HotelSearchForm from "@/components/hotels/hotel-search-form";
import { getPublishedHotels } from "@/lib/dal/public-hotels";

import { connection } from "next/server";
import Footer from "@/components/layout/footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#FFF6DC]">
      <Navbar />
      <HomeHero />
      <HotelSearchForm />
      <HomeServices />
      <HomeAbout />

      <Suspense fallback={<FeaturedHotelsFallback />}>
        <FeaturedHotels />
      </Suspense>

      <Footer />
    </main>
  );
}

async function FeaturedHotels() {
  await connection();

  const publishedHotels = await getPublishedHotels();
  const featuredHotels = publishedHotels.slice(0, 3);

  return <HomeFeaturedHotels hotels={featuredHotels} />;
}

function FeaturedHotelsFallback() {
  return (
    <section
      aria-label="Loading featured hotels"
      className="bg-white px-6 py-20 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-9 w-64 max-w-full rounded animate-pulse bg-slate-200" />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
