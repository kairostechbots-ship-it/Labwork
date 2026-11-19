ALTER TYPE "public"."user_role" ADD VALUE 'patient';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "appointments"
ADD COLUMN "user_id" uuid;

--> statement-breakpoint
ALTER TABLE "appointments"
ADD CONSTRAINT "appointments_user_id_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "public"."users"("id")
ON DELETE restrict
ON UPDATE no action;

--> statement-breakpoint
CREATE INDEX "appointments_user_id_idx"
ON "appointments" USING btree ("user_id");