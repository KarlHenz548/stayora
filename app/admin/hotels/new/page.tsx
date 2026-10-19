"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createHotelAction } from "./actions";

const initialState = {
  error: null,
  success: false,
};

export default function NewHotelPage() {
  const [state, formAction, pending] = useActionState(
    createHotelAction,
    initialState,
  );

  return (
    <section className="mx-auto max-w-3xl">
      <Link
        href="/admin"
        className="text-sm font-medium text-[#425B9A] hover:underline"
      >
        ← Back to dashboard
      </Link>

      <h1 className="mt-4 text-2xl font-bold">Add a hotel</h1>

      <p className="mt-2 text-sm text-gray-500">
        Add the hotel details for your Stayora booking platform.
      </p>

      <form
        action={formAction}
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        {state.error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-700 text-center"
          >
            {state.error}
          </p>
        )}

        {state.success && (
          <p
            role="status"
            className="rounded-xl bg-green-50 p-3 text-sm text-green-700 text-center"
          >
            Hotel created successfully!
          </p>
        )}
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Hotel name
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={120}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#425B9A]"
          />
        </div>

        <div>
          <label htmlFor="slug" className="text-sm font-medium">
            URL slug
          </label>
          <input
            id="slug"
            name="slug"
            required
            minLength={2}
            maxLength={120}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="manila-grand-hotel"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#425B9A]"
          />
          <p className="mt-1 text-xs text-gray-500">
            Lowercase letters, numbers, and single hyphens only.
          </p>
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            minLength={20}
            maxLength={2000}
            rows={4}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#425B9A]"
          />
        </div>

        <div>
          <label htmlFor="address" className="text-sm font-medium">
            Street address
          </label>
          <input
            id="address"
            name="address"
            required
            minLength={5}
            maxLength={250}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#425B9A]"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="text-sm font-medium">
              City
            </label>
            <input
              id="city"
              name="city"
              required
              minLength={2}
              maxLength={100}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#425B9A]"
            />
          </div>

          <div>
            <label htmlFor="country" className="text-sm font-medium">
              Country
            </label>
            <input
              id="country"
              name="country"
              required
              minLength={2}
              maxLength={100}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#425B9A]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="image" className="text-sm font-medium">
            Hotel cover image
          </label>

          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="mt-2 block w-full rounded-xl border border-gray-300 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#425B9A] file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-[#35497D]"
          />

          <p className="mt-2 text-xs text-gray-500">
            Upload a JPG, PNG, or WebP image. Maximum file size will be
            validated on the server.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <Link
            href="/admin"
            className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[#425B9A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#35497D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save hotel"}
          </button>
        </div>
      </form>
    </section>
  );
}
