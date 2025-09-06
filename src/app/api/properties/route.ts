import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const county = searchParams.get('county') || 'burnet';
    
    const properties = await prisma.property.findMany({
      where: { county },
      select: {
        id: true,
        propId: true,
        ownerName: true,
        situsAddr: true,
        mailAddr: true,
        landValue: true,
        mktValue: true,
        gisArea: true,
        geometry: true,
      },
    });
    const geojson = {
      type: "FeatureCollection",
      features: properties.map((prop) => ({
        type: "Feature",
        properties: {
          id: prop.id,
          propId: prop.propId,
          ownerName: prop.ownerName,
          situsAddr: prop.situsAddr,
          mailAddr: prop.mailAddr,
          landValue: prop.landValue,
          mktValue: prop.mktValue,
          gisArea: prop.gisArea,
        },
        geometry: JSON.parse(prop.geometry),
      })),
    };
    
    return NextResponse.json(geojson);
    
  } catch (error) {
    console.error('Properties API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
