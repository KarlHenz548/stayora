import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import EditHotelForm from "@/components/admin/hotels/edit-hotel-form";
import { db } from "@/lib/db";
import { hotelImages, hotels } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export const instant = false;

export default async function EditHotelPage({
  params,
}: {
  params: Promise<{ hotelId: string }>;
}) {
  await connection();
  await requireAdmin();

  const { hotelId } = await params;

  const [hotel] = await db
    .select({
      id: hotels.id,
      name: hotels.name,
      slug: hotels.slug,
      description: hotels.description,
      address: hotels.address,
      city: hotels.city,
      country: hotels.country,
    })
    .from(hotels)
    .where(eq(hotels.id, hotelId))
    .limit(1);

  if (!hotel) {
    notFound();
  }

  const [primaryImage] = await db
    .select({
      imageUrl: hotelImages.imageUrl,
      imageAlt: hotelImages.altText,
    })
    .from(hotelImages)
    .where(
      and(eq(hotelImages.hotelId, hotelId), eq(hotelImages.isPrimary, true)),
    )
    .limit(1);

  return (
    <EditHotelForm
      hotel={{
        ...hotel,
        imageUrl: primaryImage?.imageUrl ?? null,
        imageAlt: primaryImage?.imageAlt ?? null,
      }}
    />
  );
}
