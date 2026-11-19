
-- 1. Crear secuencia para los folios
CREATE SEQUENCE "appointment_folio_seq"
  AS BIGINT
  START WITH 1
  INCREMENT BY 1;
--> statement-breakpoint

-- 2. Crear función generadora
CREATE FUNCTION "generate_appointment_folio_value"()
RETURNS varchar(32)
LANGUAGE sql
VOLATILE
AS $$
  SELECT
    'LW-' ||
    EXTRACT(
      YEAR FROM CURRENT_TIMESTAMP
      AT TIME ZONE 'America/Mexico_City'
    )::int::text ||
    '-' ||
    LPAD(
      nextval('appointment_folio_seq')::text,
      6,
      '0'
    );
$$;
--> statement-breakpoint

-- 3. Agregar folio a appointments
-- PostgreSQL asignará folios a los registros existentes.
ALTER TABLE "appointments"
ADD COLUMN "folio" varchar(32)
DEFAULT generate_appointment_folio_value()
NOT NULL;
--> statement-breakpoint

-- 4. Garantizar que los folios sean únicos
CREATE UNIQUE INDEX "appointments_folio_unique"
ON "appointments" USING btree ("folio");
