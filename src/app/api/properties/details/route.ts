import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json({ error: 'Property IDs required' }, { status: 400 });
    }
    
    const ids = idsParam.split(',').map(Number).filter(id => !isNaN(id));
    
    if (ids.length === 0) {
      return NextResponse.json({ error: 'Valid property IDs required' }, { status: 400 });
    }
    
    const properties = await prisma.property.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        propId: true,
        ownerName: true,
        situsAddr: true,
        mailAddr: true,
        landValue: true,
        mktValue: true,
        gisArea: true,
        county: true,
      },
    });
    const propertyDetails = properties.reduce((acc, prop) => {
      acc[prop.id] = {
        id: prop.id,
        propId: prop.propId,
        ownerName: prop.ownerName,
        situsAddr: prop.situsAddr,
        mailAddr: prop.mailAddr,
        landValue: prop.landValue,
        mktValue: prop.mktValue,
        gisArea: prop.gisArea,
        county: prop.county,
      };
      return acc;
    }, {} as Record<number, any>);
    
    return NextResponse.json(propertyDetails);
    
  } catch (error) {
    console.error('Property details API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property details' },
      { status: 500 }
    );
  }
}
