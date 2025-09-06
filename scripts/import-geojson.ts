import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function importGeoJSON() {
  const geojsonData = JSON.parse(
    fs.readFileSync('data/burnet_parcels.geojson', 'utf8')
  );

  let count = 0;
  for (const feature of geojsonData.features) {
    await prisma.property.create({
      data: {
        county: 'burnet',
        propId: feature.properties.Prop_ID || '',
        ownerName: feature.properties.OWNER_NAME || null,
        situsAddr: feature.properties.SITUS_ADDR || null,
        mailAddr: feature.properties.MAIL_ADDR || null,
        landValue: parseFloat(feature.properties.LAND_VALUE) || null,
        mktValue: parseFloat(feature.properties.MKT_VALUE) || null,
        gisArea: parseFloat(feature.properties.GIS_AREA) || null,
        geometry: JSON.stringify(feature.geometry),
      },
    });
    count++;
  }
}

importGeoJSON()
  .catch(console.error)
  .finally(() => prisma.$disconnect());