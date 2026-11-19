CREATE TABLE "branch_home_schedule_settings" (
	"branch_id" uuid PRIMARY KEY NOT NULL,
	"weekday_open" time NOT NULL,
	"weekday_close" time NOT NULL,
	"saturday_open" time NOT NULL,
	"saturday_close" time NOT NULL,
	"slot_minutes" integer DEFAULT 60 NOT NULL,
	"capacity" integer DEFAULT 1 NOT NULL,
	"minimum_advance_days" integer DEFAULT 1 NOT NULL,
	"requires_confirmation" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branch_home_schedule_settings" ADD CONSTRAINT "branch_home_schedule_settings_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;