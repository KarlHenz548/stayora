"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Hotel, CalendarDays, UserRound } from "lucide-react";

import StayoraLogo from "@/components/ui/stayora-logo";
import AccountMenu from "@/components/layout/account-menu";
import { authClient } from "@/lib/auth-client";

const navigationItems = [
  {
    label: "Explore hotels",
    href: "/hotels",
    icon: Hotel,
  },
  {
    label: "My bookings",
    href: "/bookings",
    icon: CalendarDays,
  },
  {
    label: "My profile",
    href: "/profile",
    icon: UserRound,
  },
];

export default function CustomerSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  function closeMobileMenu() {
    setIsMobileOpen(false);
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[#425B9A]/10 bg-[#FFF6DC] px-5 md:hidden">
        <StayoraLogo className="text-[#425B9A]" text="Stayora" />
        <button
          type="button"
          aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen((open) => !open)}
          className="flex size-10 items-center justify-center rounded-xl text-[#425B9A] transition hover:bg-[#425B9A]/10"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#425B9A]/10 bg-[#FFF6DC] p-5 transition-transform duration-200 md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden shrink-0 md:block">
          <StayoraLogo className="text-[#425B9A]" text="Stayora" />
        </div>

        <nav
          aria-label="Customer navigation"
          className="mt-20 flex flex-1 flex-col gap-2 overflow-y-auto md:mt-10"
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/hotels" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#425B9A] text-white"
                    : "text-[#26334D] hover:bg-[#425B9A]/10 hover:text-[#425B9A]"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 border-t border-[#425B9A]/10 pt-4">
          {isPending ? (
            <div
              aria-label="Loading account"
              className="h-14 animate-pulse rounded-xl bg-[#425B9A]/10"
            />
          ) : session ? (
            <AccountMenu
              name={session.user.name}
              role={session.user.role}
              image={session.user.image}
              variant="customer-sidebar"
              onNavigate={closeMobileMenu}
            />
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/sign-in"
                onClick={closeMobileMenu}
                className="flex min-h-11 items-center justify-center rounded-xl border border-[#425B9A]/20 px-4 py-3 text-sm font-semibold text-[#425B9A] transition hover:bg-[#425B9A]/10"
              >
                Sign in
              </Link>

              <Link
                href="/sign-up"
                onClick={closeMobileMenu}
                className="flex min-h-11 items-center justify-center rounded-xl bg-[#425B9A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#35497D]"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
