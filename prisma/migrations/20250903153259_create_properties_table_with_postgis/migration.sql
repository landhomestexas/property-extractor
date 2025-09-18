-- CreateTable
CREATE TABLE "public"."properties" (
    "id" SERIAL NOT NULL,
    "county" TEXT NOT NULL,
    "prop_id" TEXT NOT NULL,
    "owner_name" TEXT,
    "situs_addr" TEXT,
    "mail_addr" TEXT,
    "land_value" DOUBLE PRECISION,
    "mkt_value" DOUBLE PRECISION,
    "gis_area" DOUBLE PRECISION,
    "geometry" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "properties_county_idx" ON "public"."properties"("county");

-- Enable RLS on the properties table
ALTER TABLE "public"."properties" ENABLE ROW LEVEL SECURITY;

-- Allow public read access (since this is property data)
CREATE POLICY "Allow public read access" ON "public"."properties"
FOR SELECT USING (true);

-- Restrict insert/update/delete to authenticated users only
CREATE POLICY "Allow authenticated insert" ON "public"."properties"
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON "public"."properties"
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON "public"."properties"
FOR DELETE USING (auth.role() = 'authenticated');