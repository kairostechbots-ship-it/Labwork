CREATE TABLE "schedule_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "appointment_type" NOT NULL,
	"branch_id" uuid,
	"blocked_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"reason" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "appointment_type" NOT NULL,
	"branch_id" uuid,
	"weekday" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"slot_duration_minutes" integer DEFAULT 60 NOT NULL,
	"capacity" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"laboratory_name" varchar(160) NOT NULL,
	"email" varchar(254),
	"phone" varchar(30),
	"whatsapp" varchar(30),
	"facebook_url" text,
	"instagram_url" text,
	"appointment_notice" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "created_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_rules" ADD CONSTRAINT "schedule_rules_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "schedule_blocks_target_date_idx" ON "schedule_blocks" USING btree ("type","branch_id","blocked_date");--> statement-breakpoint
CREATE INDEX "schedule_rules_target_day_idx" ON "schedule_rules" USING btree ("type","branch_id","weekday");--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "schedule_rules" ADD CONSTRAINT "schedule_rules_target_check" CHECK (("type" = 'branch' AND "branch_id" IS NOT NULL) OR ("type" = 'home' AND "branch_id" IS NULL));
--> statement-breakpoint
ALTER TABLE "schedule_rules" ADD CONSTRAINT "schedule_rules_values_check" CHECK ("weekday" BETWEEN 0 AND 6 AND "start_time" < "end_time" AND "slot_duration_minutes" BETWEEN 15 AND 480 AND "capacity" BETWEEN 1 AND 100);
--> statement-breakpoint
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_target_check" CHECK (("type" = 'branch' AND "branch_id" IS NOT NULL) OR ("type" = 'home' AND "branch_id" IS NULL));
--> statement-breakpoint
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_time_check" CHECK (("start_time" IS NULL AND "end_time" IS NULL) OR ("start_time" IS NOT NULL AND "end_time" IS NOT NULL AND "start_time" < "end_time"));
--> statement-breakpoint
CREATE OR REPLACE FUNCTION enforce_appointment_availability() RETURNS trigger AS $$
DECLARE
  allowed_capacity integer;
  current_reservations integer;
BEGIN
  IF NEW.status <> 'confirmed' THEN RETURN NEW; END IF;
  PERFORM pg_advisory_xact_lock(hashtext(concat(NEW.type, ':', coalesce(NEW.branch_id::text, 'home'), ':', NEW.requested_date, ':', NEW.requested_time)));
  SELECT max(r.capacity) INTO allowed_capacity
  FROM schedule_rules r
  WHERE r.is_active = true
    AND r.type = NEW.type
    AND r.branch_id IS NOT DISTINCT FROM NEW.branch_id
    AND r.weekday = extract(dow from NEW.requested_date)
    AND NEW.requested_time >= r.start_time
    AND NEW.requested_time + make_interval(mins => r.slot_duration_minutes) <= r.end_time
    AND mod((extract(epoch from (NEW.requested_time - r.start_time)) / 60)::integer, r.slot_duration_minutes) = 0;
  IF allowed_capacity IS NULL THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'appointment_slot_unavailable'; END IF;
  IF EXISTS (SELECT 1 FROM schedule_blocks b WHERE b.type = NEW.type AND b.branch_id IS NOT DISTINCT FROM NEW.branch_id AND b.blocked_date = NEW.requested_date AND (b.start_time IS NULL OR NEW.requested_time >= b.start_time AND NEW.requested_time < b.end_time)) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'appointment_slot_unavailable';
  END IF;
  SELECT count(*) INTO current_reservations FROM appointments a
  WHERE a.id <> NEW.id AND a.status = 'confirmed' AND a.type = NEW.type
    AND a.branch_id IS NOT DISTINCT FROM NEW.branch_id AND a.requested_date = NEW.requested_date AND a.requested_time = NEW.requested_time;
  IF current_reservations >= allowed_capacity THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'appointment_slot_unavailable'; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER appointments_availability_trigger BEFORE INSERT OR UPDATE OF status, type, branch_id, requested_date, requested_time ON "appointments" FOR EACH ROW EXECUTE FUNCTION enforce_appointment_availability();
