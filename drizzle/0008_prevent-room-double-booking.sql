-- Custom SQL migration file, put your code below! --
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "booking_rooms"
ADD CONSTRAINT "booking_rooms_no_overlapping_active_dates"
EXCLUDE USING gist (
    "room_id" WITH =,
    daterange("check_in", "check_out", '[)') WITH &&
)
WHERE ("is_active" = true);