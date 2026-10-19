CREATE TABLE "booking_room_nights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_room_id" uuid NOT NULL,
	"stay_date" date NOT NULL,
	"price_per_night" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "booking_room_nights_room_date_unique" UNIQUE("booking_room_id","stay_date"),
	CONSTRAINT "booking_room_nights_positive_price" CHECK ("booking_room_nights"."price_per_night" > 0)
);
--> statement-breakpoint
ALTER TABLE "booking_room_nights" ADD CONSTRAINT "booking_room_nights_booking_room_id_booking_rooms_id_fk" FOREIGN KEY ("booking_room_id") REFERENCES "public"."booking_rooms"("id") ON DELETE cascade ON UPDATE no action;