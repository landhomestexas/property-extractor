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
