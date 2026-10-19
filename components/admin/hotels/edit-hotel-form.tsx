"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  updateHotelAction,
  type EditHotelFormState,
} from "@/app/admin/hotels/[hotelId]/edit/actions";
import Image from "next/image";

type HotelEditData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  country: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

const initialState: EditHotelFormState = {
  error: null,
  success: false,
};

export default function EditHotelForm({ hotel }: { hotel: HotelEditData }) {
  const [state, formAction, pending] = useActionState(
    updateHotelAction,
    initialState,
  );

  return (
    <section className="mx-auto max-w-3xl">
      <Link
        href="/admin/hotels"
        className="text-sm font-medium text-[#425B9A] hover:underline"
      >
        ← Back to hotels
      </Link>

      <h1 className="mt-4 text-2xl font-bold">Edit hotel</h1>
      <p className="mt-2 text-sm text-gray-500">
        Update the details for {hotel.name}.
      </p>

      <form
        action={formAction}
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <input type="hidden" name="hotelId" value={hotel.id} />

        {state.error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-700"
          >
            {state.error}
          </p>
        )}

        {state.success && (
          <p
            role="status"
            className="rounded-xl bg-green-50 p-3 text-center text-sm text-green-700"
          >
            Hotel updated successfully!
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
            defaultValue={hotel.name}
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
            defaultValue={hotel.slug}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#425B9A]"
          />
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
            defaultValue={hotel.description}
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
            defaultValue={hotel.address}
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
              defaultValue={hotel.city}
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
              defaultValue={hotel.country}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#425B9A]"
            />
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h2 className="text-sm font-semibold">Hotel cover image</h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload a new image to add or replace the current cover image.
            </p>

            {hotel.imageUrl ? (
              <div className="mt-4">
                <Image
                  src={hotel.imageUrl}
                  alt={hotel.imageAlt ?? `${hotel.name} cover image`}
                  width={800}
                  height={450}
                  className="aspect-video w-full max-w-xl rounded-xl border border-gray-200 object-cover"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Current cover image
                </p>
              </div>
            ) : (
              <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                No cover image uploaded yet.
              </p>
            )}

            <label htmlFor="image" className="mt-5 block text-sm font-medium">
              {hotel.imageUrl ? "Replace cover image" : "Upload cover image"}
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-2 block w-full rounded-xl border border-gray-300 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#425B9A] file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-[#35497D]"
            />
            <p className="mt-2 text-xs text-gray-500">
              JPG, PNG, or WebP. Maximum file size: 5 MB. Leave empty to keep
              the current image.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <Link
            href="/admin/hotels"
            className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[#425B9A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#35497D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
