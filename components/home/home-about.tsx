import Image from "next/image";

export default function HomeAbout() {
  return (
    <section
      id="about"
      className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-10 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-16"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#425B9A]">
          About Stayora
        </p>

        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          A better way to find your next stay.
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          Stayora helps travelers discover comfortable accommodations and book
          their next getaway with confidence.
        </p>
      </div>

      <div className="relative min-h-64 overflow-hidden rounded-3xl sm:min-h-96">
        <Image
          src="/images/beach4.jpg"
          alt="Scenic beach destination for a relaxing getaway"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
