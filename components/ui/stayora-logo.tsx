import Link from "next/link";

type StayoraLogoProps = {
  className?: string;
  text?: string;
};

export default function StayoraLogo({
  className = "",
  text = "Stayora",
}: StayoraLogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${text} home`}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-[#FFF6DC]">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          aria-hidden="true"
          className="size-7"
        >
          <path
            d="M10 31V17a10 10 0 0 1 20 0v14"
            stroke="#425B9A"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M15 31V20a5 5 0 0 1 10 0v11"
            stroke="#425B9A"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="28" cy="11" r="3" fill="#FF95A5" />
        </svg>
      </span>

      <span
        className={`text-2xl font-bold tracking-tight ${
          className.includes("text-[#425B9A]") ? "text-[#425B9A]" : "text-white"
        }`}
      >
        {text}
        <span className="text-[#FF95A5]">.</span>
      </span>
    </Link>
  );
}
