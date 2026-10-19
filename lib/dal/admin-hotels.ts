
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { hotels } from "@/lib/db/schema";

export async function getAdminHotels() {
  return db
    .select({
      id: hotels.id,
      name: hotels.name,
      slug: hotels.slug,
      city: hotels.city,
      country: hotels.country,
      status: hotels.status,
      createdAt: hotels.createdAt,
    })
    .from(hotels)
    .orderBy(desc(hotels.createdAt));
}
