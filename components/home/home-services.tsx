import Link from "next/link";
import { CalendarCheck, Search, ShieldCheck } from "lucide-react";

const services = [
  {
    icon: Search,
    title: "Discover Your Stay",
    description:
      "Explore available hotels and find a place that fits your destination and travel plans.",
  },
  {
    icon: CalendarCheck,
    title: "Simple Booking",
    description:
      "Choose your dates, review room options, and organize your next getaway in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Manage Your Bookings",
    description:
      "Keep track of your reservations and review your booking details whenever you need them.",
  },
];

export default function HomeServices() {
  return (
    <section
      id="services"
      className="scroll-mt-28 bg-white px-5 py-16 sm:px-10 sm:py-20 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#425B9A]">
            Our Services
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need for your next stay.
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600">
            From discovering accommodations to keeping your reservations
            organized, Stayora makes planning your stay easier.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-3xl border border-[#425B9A]/10 bg-[#FFF6DC]/50 p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#425B9A]/10 text-[#425B9A]">
                <Icon size={24} aria-hidden="true" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-900">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {description}
              </p>

              <Link
                href="/hotels"
                className="mt-6 inline-flex text-sm font-semibold text-[#425B9A] transition hover:text-[#344979]"
              >
                Explore hotels →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
