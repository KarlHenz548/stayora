"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import StayoraLogo from "../ui/stayora-logo";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  function closeMobileMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="absolute inset-x-0 top-0 z-50 shadow-sm">
      <nav className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <StayoraLogo />

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/hotels"
            className="text-sm font-medium text-[#425B9A] transition hover:text-white"
          >
            Hotels
          </Link>
          <Link
            href="/#services"
            onClick={closeMobileMenu}
            className="font-medium text-[#425B9A] transition hover:text-white"
          >
            Services
          </Link>

          <Link
            href="/#about"
            className="text-sm font-medium text-[#425B9A] transition hover:text-white"
          >
            About
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!isPending && !session && (
            <>
              <Link
                href="/sign-in"
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#425B9A] transition hover:bg-white"
              >
                Sign in
              </Link>

              <Link
                href="/sign-up"
                className="rounded-full bg-[#FFF6DC] px-5 py-2.5 text-sm font-semibold text-[#425B9A] transition hover:bg-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-white transition hover:bg-white/15 md:hidden"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isMenuOpen && (
          <div className="absolute inset-x-6 top-full rounded-2xl bg-[#FFF6DC] p-5 shadow-xl md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="/hotels"
                onClick={closeMobileMenu}
                className="font-medium text-[#425B9A]"
              >
                Hotels
              </Link>
              <Link
                href="/#services"
                onClick={closeMobileMenu}
                className="font-medium text-[#425B9A]"
              >
                Services
              </Link>

              <Link
                href="/#about"
                onClick={closeMobileMenu}
                className="font-medium text-[#425B9A]"
              >
                About
              </Link>

              {!isPending && !session && (
                <>
                  <hr className="border-[#425B9A]/15" />

                  <Link
                    href="/sign-in"
                    onClick={closeMobileMenu}
                    className="font-medium text-[#425B9A]"
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/sign-up"
                    onClick={closeMobileMenu}
                    className="rounded-full bg-[#425B9A] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#344979]"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
