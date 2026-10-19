
ALTER TABLE "room_rates"
ADD CONSTRAINT "room_rates_no_overlapping_dates"
EXCLUDE USING gist (
    "room_type_id" WITH =,
    daterange("start_date", "end_date", '[)') WITH &&
);
