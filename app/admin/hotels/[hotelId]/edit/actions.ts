
"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { cloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { hotelImages, hotels } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { hotelSchema } from "@/lib/validations/hotel";

export type EditHotelFormState = {
  error: string | null;
  success: boolean;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type UploadedHotelImage = {
  secure_url: string;
  public_id: string;
};

function uploadHotelImage(
  buffer: Buffer,
): Promise<UploadedHotelImage> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "stayora/hotels",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary returned no upload result."));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    stream.end(buffer);
  });
}

export async function updateHotelAction(
  _previousState: EditHotelFormState,
  formData: FormData,
): Promise<EditHotelFormState> {
  await requireAdmin();

  const hotelId = formData.get("hotelId");

  if (
    typeof hotelId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      hotelId,
    )
  ) {
    return {
      error: "Invalid hotel ID.",
      success: false,
    };
  }

  const result = hotelSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    address: formData.get("address"),
    city: formData.get("city"),
    country: formData.get("country"),
  });

  if (!result.success) {
    return {
      error: result.error.issues[0].message,
      success: false,
    };
  }

  const imageValue = formData.get("image");

  if (imageValue !== null && !(imageValue instanceof File)) {
    return {
      error: "Invalid image upload.",
      success: false,
    };
  }

  const image =
    imageValue instanceof File && imageValue.size > 0
      ? imageValue
      : null;

  if (image && !ALLOWED_IMAGE_TYPES.includes(image.type)) {
    return {
      error: "Only JPG, PNG, and WebP images are allowed.",
      success: false,
    };
  }

  if (image && image.size > MAX_IMAGE_SIZE) {
    return {
      error: "The image must be 5 MB or smaller.",
      success: false,
    };
  }

  let uploadedImage: UploadedHotelImage | null = null;

  try {
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      uploadedImage = await uploadHotelImage(buffer);
    }

    await db.transaction(async (tx) => {
      const [hotel] = await tx
        .update(hotels)
        .set(result.data)
        .where(eq(hotels.id, hotelId))
        .returning({
          id: hotels.id,
          name: hotels.name,
        });

      if (!hotel) {
        throw new Error("Hotel not found.");
      }

      if (uploadedImage) {
        const [primaryImage] = await tx
          .select({ id: hotelImages.id })
          .from(hotelImages)
          .where(
            and(
              eq(hotelImages.hotelId, hotelId),
              eq(hotelImages.isPrimary, true),
            ),
          )
          .limit(1);

        const imageData = {
          imageUrl: uploadedImage.secure_url,
          altText: `${hotel.name} cover image`,
          isPrimary: true,
          sortOrder: 0,
        };

        if (primaryImage) {
          await tx
            .update(hotelImages)
            .set(imageData)
            .where(eq(hotelImages.id, primaryImage.id));
        } else {
          await tx.insert(hotelImages).values({
            hotelId,
            ...imageData,
          });
        }
      }

      return hotel;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/hotels");
    revalidatePath(`/admin/hotels/${hotelId}`);
    revalidatePath(`/admin/hotels/${hotelId}/edit`);
    revalidatePath("/hotels");
    revalidatePath(`/hotels/${result.data.slug}`);

    return {
      error: null,
      success: true,
    };
  } catch (error) {
    console.error("Failed to update hotel:", error);

    if (uploadedImage) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.public_id);
      } catch {

      }
    }

    return {
      error:
        "Unable to update hotel. The URL slug may already be in use, or the image upload failed.",
      success: false,
    };
  }
}
