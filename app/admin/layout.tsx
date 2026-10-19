import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import AccountMenu from "@/components/layout/account-menu";

export const instant = false;

const navigationItems = [
  { label: "Overview", href: "/admin" },
  { label: "Hotels", href: "/admin/hotels" },
  { label: "Rooms", href: "/admin/rooms" },
  { label: "Bookings", href: "/admin/bookings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#26334D] md:min-h-0">
      <aside className="flex w-full flex-col border-b border-gray-200 bg-white p-5 sm:p-6 md:fixed md:inset-y-0 md:left-0 md:z-40 md:h-dvh md:w-64 md:overflow-y-auto md:border-b-0 md:border-r md:p-6">
        <div className="shrink-0">
          <Link href="/admin" className="text-xl font-bold text-[#425B9A]">
            Stayora Admin
          </Link>

          <p className="mt-2 text-xs text-gray-500">Hotel booking management</p>
        </div>

        <nav
          aria-label="Admin navigation"
          className="mt-6 flex flex-wrap gap-2 md:flex-col md:gap-1"
        >
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-[#425B9A]/10 hover:text-[#425B9A]"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            View public site
          </Link>
        </nav>

        <div className="mt-6 border-t border-gray-200 pt-5 md:mt-auto md:pt-5">
          <AccountMenu
            name={session.user.name}
            role={session.user.role}
            image={session.user.image}
            variant="admin-sidebar"
          />
        </div>
      </aside>

      <main className="min-w-0 p-4 sm:p-6 md:ml-64 md:p-10">{children}</main>
    </div>
  );
}
