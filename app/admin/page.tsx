import { getAdminDashboardStats } from "@/lib/dal/admin-dashboard";
import Link from "next/link";

import { connection } from "next/server";

export const instant = false;

export default async function AdminPage() {
  await connection();

  const stats = await getAdminDashboardStats();

  const cards = [
    { label: "Total Hotels", value: stats.totalHotels },
    { label: "Total Rooms", value: stats.totalRooms },
    { label: "Total Bookings", value: stats.totalBookings },
    { label: "Pending Bookings", value: stats.pendingBookings },
  ];

  return (
    <section>
      <p className="text-sm font-medium text-[#425B9A]">Dashboard overview</p>

      <h1 className="mt-2 text-2xl font-bold">Welcome to Stayora</h1>

      <p className="mt-2 text-sm text-gray-500">
        Manage your hotel booking platform from one place.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-white bg-white p-6 shadow-[0_4px_20px_rgba(38,51,77,0.06)]"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-[#26334D]">
              {card.value}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-[#26334D]">Quick Actions</h2>

        <p className="mt-1 text-sm text-gray-500">
          Common tasks to manage your platform.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/admin/hotels/new"
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#425B9A] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A]"
          >
            <h3 className="font-semibold text-[#26334D]">Add Hotel</h3>
            <p className="mt-2 text-sm text-gray-500">Register a new hotel.</p>
          </Link>

          <Link
            href="/admin/hotels"
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#425B9A] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A]"
          >
            <h3 className="font-semibold text-[#26334D]">Manage Hotels</h3>
            <p className="mt-2 text-sm text-gray-500">
              Edit hotel details and status.
            </p>
          </Link>

          <Link
            href="/admin/rooms"
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#425B9A] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A]"
          >
            <h3 className="font-semibold text-[#26334D]">Manage Rooms</h3>
            <p className="mt-2 text-sm text-gray-500">
              Manage room types, rooms, and rates.
            </p>
          </Link>

          <Link
            href="/admin/bookings"
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#425B9A] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A]"
          >
            <h3 className="font-semibold text-[#26334D]">View Bookings</h3>
            <p className="mt-2 text-sm text-gray-500">
              Review guest reservations.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
