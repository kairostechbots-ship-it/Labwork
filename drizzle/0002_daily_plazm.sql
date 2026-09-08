CREATE INDEX "appointment_packages_package_id_idx" ON "appointment_packages" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "appointment_services_service_id_idx" ON "appointment_services" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "appointment_status_history_appointment_id_idx" ON "appointment_status_history" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "appointments_status_idx" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "appointments_requested_date_idx" ON "appointments" USING btree ("requested_date");--> statement-breakpoint
CREATE INDEX "appointments_branch_id_idx" ON "appointments" USING btree ("branch_id");