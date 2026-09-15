CREATE TABLE "appointment_rate_limits" (
	"identifier_hash" varchar(64) NOT NULL,
	"bucket_start" timestamp with time zone NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "appointment_rate_limits_identifier_hash_bucket_start_pk" PRIMARY KEY("identifier_hash","bucket_start")
);
