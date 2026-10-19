
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hotelImages, hotels } from "@/lib/db/schema";
import { cloudinary } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/require-admin";
import { hotelSchema } from "@/lib/validations/hotel";

export type HotelFormState = {
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

export async function createHotelAction(
  _previousState: HotelFormState,
  formData: FormData,
): Promise<HotelFormState> {
  await requireAdmin();

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

  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    return {
      error: "Please select a hotel cover image.",
      success: false,
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
    return {
      error: "Only JPG, PNG, and WebP images are allowed.",
      success: false,
    };
  }

  if (image.size > MAX_IMAGE_SIZE) {
    return {
      error: "The image must be 5 MB or smaller.",
      success: false,
    };
  }

  let uploadedImage: UploadedHotelImage | null = null;

  try {
    const buffer = Buffer.from(await image.arrayBuffer());

    uploadedImage = await uploadHotelImage(buffer);

    await db.transaction(async (tx) => {
      const [hotel] = await tx
        .insert(hotels)
        .values(result.data)
        .returning({
          id: hotels.id,
          name: hotels.name,
        });

      if (!hotel) {
        throw new Error("Hotel creation returned no record.");
      }

      await tx.insert(hotelImages).values({
        hotelId: hotel.id,
        imageUrl: uploadedImage!.secure_url,
        altText: `${hotel.name} cover image`,
        isPrimary: true,
        sortOrder: 0,
      });
    });

    revalidatePath("/admin");
    revalidatePath("/admin/hotels");
    revalidatePath("/hotels");

    return {
      error: null,
      success: true,
    };
  } catch {
    if (uploadedImage) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.public_id);
      } catch {
        // Cleanup failure should not expose server details.
      }
    }

    return {
      error:
        "Unable to save hotel. Check that the URL slug is unique and Cloudinary is configured correctly.",
      success: false,
    };
  }
}
