"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction } from "./actions";
import StayoraLogo from "@/components/ui/stayora-logo";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInAction, {
    error: null,
    success: false,
    destination: null,
  });

  const router = useRouter();

  useEffect(() => {
    if (!state.success) {
      return;
    }

    if (state.destination === "/admin") {
      router.replace("/admin");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const callbackURL = params.get("callbackURL");

    const destination =
      callbackURL?.startsWith("/") && !callbackURL.startsWith("//")
        ? callbackURL
        : "/hotels";

    router.replace(destination);
  }, [state.success, state.destination, router]);

  return (
    <section className="rounded-3xl bg-white p-8 shadow-[8px_8px_20px_rgba(66,91,154,0.10)">
      <div className="mb-8 text-center">
        <div className="mb-6 flex justify-center">
          <StayoraLogo className="[&>span:last-child]:text-[#425B9A]" />
        </div>

        <h1 className="text-2xl font-bold text-[#425B9A]">Welcome back</h1>

        <p className="mt-2 text-sm text-gray-500">
          Sign in to continue to Stayora.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#425B9A] focus:ring-2 focus:ring-[#425B9A]/20"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#425B9A] focus:ring-2 focus:ring-[#425B9A]/20"
          />
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-[#425B9A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#344979] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-[#425B9A] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </section>
  );
}
