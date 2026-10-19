import Link from "next/link";
import StayoraLogo from "@/components/ui/stayora-logo";

const footerLinks = [
  { label: "Hotels", href: "/hotels" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
];

export default function Footer() {
  return (
    <footer className="bg-[#17233D] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-10 md:grid-cols-2 lg:grid-cols-4 lg:px-16 lg:py-16">
        <div className="lg:col-span-2">
          <StayoraLogo />
          <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
            Discover comfortable stays, explore new destinations, and plan your
            next getaway with Stayora.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#FFF6DC]">
            Explore
          </h2>

          <ul className="mt-4 space-y-3">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-white/70 transition hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#FFF6DC]">
            Your Account
          </h2>

          <ul className="mt-4 space-y-3">
            <li>
              <Link
                href="/sign-in"
                className="text-sm text-white/70 transition hover:text-white"
              >
                Sign in
              </Link>
            </li>
            <li>
              <Link
                href="/sign-up"
                className="text-sm text-white/70 transition hover:text-white"
              >
                Create an account
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-sm text-white/60 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-16">
          <p>© 2026 Stayora. All rights reserved.</p>
          <p>Find your next stay.</p>
        </div>
      </div>
    </footer>
  );
}
