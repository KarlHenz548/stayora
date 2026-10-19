"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";

type AccountMenuProps = {
  name: string;
  role?: string | null;
  image?: string | null;
  variant?: "desktop" | "mobile" | "admin-sidebar" | "customer-sidebar";
  onNavigate?: () => void;
};

export default function AccountMenu({
  name,
  role,
  image,
  variant = "desktop",
  onNavigate,
}: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = role === "admin";

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  function closeMenu() {
    setIsOpen(false);
    setError(null);
    onNavigate?.();
  }

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setError(null);
    closeMenu();

    try {
      const result = await signOutAction();

      if (!result.success) {
        setError("Unable to sign out. Please try again.");
        setIsOpen(true);
        return;
      }

      window.location.replace("/");
    } catch {
      setError("Something went wrong while signing out. Please try again.");
      setIsOpen(true);
    } finally {
      setIsSigningOut(false);
    }
  }

  const avatar = (
    <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#425B9A] text-sm font-semibold text-white ring-2 ring-white/70">
      {image ? (
        <Image
          src={image}
          alt=""
          width={44}
          height={44}
          className="size-full object-cover"
        />
      ) : (
        initials || <UserRound size={22} />
      )}
    </span>
  );

  const errorMessage = error && (
    <p role="alert" className="px-3 py-2 text-sm text-red-600">
      {error}
    </p>
  );

  const isSidebar =
    variant === "admin-sidebar" || variant === "customer-sidebar";

  return (
    <div
      className={
        variant === "mobile" || isSidebar ? "relative w-full" : "relative"
      }
    >
      <button
        type="button"
        aria-label="Toggle account menu"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((open) => !open);
          setError(null);
        }}
        className={
          variant === "mobile"
            ? "flex w-full items-center justify-between rounded-xl p-2 transition hover:bg-white/60"
            : isSidebar
              ? "flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-[#425B9A]/10"
              : "flex items-center gap-1 rounded-full transition hover:opacity-90"
        }
      >
        {avatar}

        {variant === "mobile" && (
          <span className="flex flex-1 items-center justify-end gap-2 text-sm font-medium text-[#425B9A]">
            Account
            <ChevronDown
              size={16}
              className={`transition ${isOpen ? "rotate-180" : ""}`}
            />
          </span>
        )}

        {isSidebar && (
          <>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-semibold text-[#26334D]">
                {name}
              </span>
              <span className="block text-xs text-gray-500">
                {variant === "admin-sidebar" ? "Administrator" : "My Account"}
              </span>
            </span>

            <ChevronDown
              size={16}
              className={`shrink-0 text-gray-500 transition ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      {isOpen && (
        <div
          className={
            variant === "mobile"
              ? "mt-2 rounded-2xl border border-[#425B9A]/10 bg-white p-2 shadow-lg"
              : isSidebar
                ? "absolute bottom-full left-0 z-50 mb-3 w-full rounded-2xl border border-[#425B9A]/10 bg-white p-2 shadow-xl"
                : "absolute right-0 top-full z-50 mt-3 w-64 rounded-2xl border border-[#425B9A]/10 bg-white p-2 shadow-xl"
          }
        >
          {variant !== "admin-sidebar" && (
            <>
              <div className="px-4 py-3">
                <p className="truncate text-sm font-semibold text-[#243047]">
                  {name}
                </p>
              </div>

              <div className="my-1 border-t border-[#425B9A]/10" />
            </>
          )}

          {errorMessage}

          <Link
            href={isAdmin ? "/admin" : "/bookings"}
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#26334D] transition hover:bg-[#425B9A]/10 hover:text-[#425B9A]"
          >
            <UserRound size={18} />
            {isAdmin ? "Admin Dashboard" : "My Bookings"}
          </Link>

          <Link
            href="/profile"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#26334D] transition hover:bg-[#425B9A]/10 hover:text-[#425B9A]"
          >
            <UserRound size={18} />
            Profile
          </Link>

          <Link
            href="/settings"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#26334D] transition hover:bg-[#425B9A]/10 hover:text-[#425B9A]"
          >
            <Settings size={18} />
            Settings
          </Link>

          <div className="my-1 border-t border-[#425B9A]/10" />

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={18} />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
