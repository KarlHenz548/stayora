CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE "room_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_type_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"price_per_night" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "room_rates_valid_date_range" CHECK ("room_rates"."end_date" > "room_rates"."start_date"),
	CONSTRAINT "room_rates_positive_price" CHECK ("room_rates"."price_per_night" > 0)
);
--> statement-breakpoint
ALTER TABLE "room_rates" ADD CONSTRAINT "room_rates_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "room_rates"
ADD CONSTRAINT "room_rates_no_overlapping_dates"
EXCLUDE USING gist (
    "room_type_id" WITH =,
    daterange("start_date", "end_date", '[)') WITH &&
);