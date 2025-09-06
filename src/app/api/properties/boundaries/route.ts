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
        },
        geometry: JSON.parse(prop.geometry),
      })),
    };
    
    return NextResponse.json(geojson);
    
  } catch (error) {
    console.error('Property boundaries API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property boundaries' },
      { status: 500 }
    );
  }
}
