import Image from "next/image";

export default function HomeHero() {
  return (
    <section className="relative isolate min-h-175 overflow-hidden sm:min-h-162.5">
      <Image
        src="/images/beach2.jpg"
        alt="Beautiful beach destination"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />

      <div className="absolute inset-0 -z-10 bg-[#17233D]/40" />

      <div className="mx-auto flex min-h-175 max-w-7xl flex-col justify-center px-5 py-28 sm:min-h-162.5 sm:px-10 sm:py-20 lg:px-16">
        <div className="max-w-2xl text-white">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#FFF6DC]">
            Your next escape starts here
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
            Discover your next stay.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
            Find beautiful places, comfortable rooms, and memorable destinations
            for your next adventure.
          </p>
        </div>
      </div>
    </section>
  );
}
