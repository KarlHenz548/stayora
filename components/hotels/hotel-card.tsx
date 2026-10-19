import Image from "next/image";
import Link from "next/link";

type HotelCardProps = {
  slug: string;
  name: string;
  location: string;
  image: string;
};

export default function HotelCard({
  slug,
  name,
  location,
  image,
}: HotelCardProps) {
  return (
    <Link
      href={`/hotels/${slug}`}
      className="block h-full w-full min-w-70 overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#425B9A]"
    >
      <article className="h-full">
        <div className="relative h-56">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            className="object-cover"
          />
        </div>

        <div className="p-5">
          <h3 className="wrap-break-words text-lg font-bold text-slate-900">
            {name}
          </h3>

          <p className="mt-2 text-sm text-slate-500">{location}</p>
          <p className="mt-4 text-sm font-semibold text-[#425B9A]">
            View hotel details
          </p>
        </div>
      </article>
    </Link>
  );
}
