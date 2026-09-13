CREATE TABLE "google_calendar_connections" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"google_email" varchar(254) NOT NULL,
	"encrypted_refresh_token" text NOT NULL,
	"scopes" text NOT NULL,
	"connected_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_calendar_mappings" (
	"key" varchar(200) PRIMARY KEY NOT NULL,
	"branch_id" uuid,
	"calendar_id" text NOT NULL,
	"calendar_name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "google_calendar_id" text;--> statement-breakpoint
ALTER TABLE "google_calendar_connections" ADD CONSTRAINT "google_calendar_connections_connected_by_user_id_users_id_fk" FOREIGN KEY ("connected_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_calendar_mappings" ADD CONSTRAINT "google_calendar_mappings_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "google_calendar_mappings_branch_unique" ON "google_calendar_mappings" USING btree ("branch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "google_calendar_mappings_calendar_unique" ON "google_calendar_mappings" USING btree ("calendar_id");