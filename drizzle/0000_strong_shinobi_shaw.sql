CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."appointment_type" AS ENUM('branch', 'home');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_name" varchar(160) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"email" varchar(254),
	"type" "appointment_type" NOT NULL,
	"branch_id" uuid,
	"address" text,
	"requested_date" date NOT NULL,
	"requested_time" time NOT NULL,
	"studies" text,
	"notes" text,
	"status" "appointment_status" DEFAULT 'pending' NOT NULL,
	"google_calendar_event_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"address" text NOT NULL,
	"phone" varchar(30) NOT NULL,
	"whatsapp" varchar(30),
	"map_url" text,
	"business_hours" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_services" (
	"package_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	CONSTRAINT "package_services_package_id_service_id_pk" PRIMARY KEY("package_id","service_id")
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"description" text,
	"preparation" text,
	"price" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"category" varchar(100),
	"description" text,
	"preparation" text,
	"price" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_services" ADD CONSTRAINT "package_services_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_services" ADD CONSTRAINT "package_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "branches_slug_unique" ON "branches" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "packages_slug_unique" ON "packages" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "services_slug_unique" ON "services" USING btree ("slug");