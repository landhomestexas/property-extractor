import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface PropertyDetails {
  id: number;
  propId: string;
  ownerName: string | null;
  situsAddr: string | null;
  mailAddr: string | null;
  landValue: number | null;
  mktValue: number | null;
  gisArea: number | null;
  county: string;
  geometry?: string;
}

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
    
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, prop_id, owner_name, situs_addr, mail_addr, land_value, mkt_value, gis_area, county, geometry')
      .in('id', ids);

    if (error) throw error;

    const propertyDetails = properties.reduce((acc, prop) => {
      acc[prop.id] = {
        id: prop.id,
        propId: prop.prop_id,
        ownerName: prop.owner_name,
        situsAddr: prop.situs_addr,
        mailAddr: prop.mail_addr,
        landValue: prop.land_value,
        mktValue: prop.mkt_value,
        gisArea: prop.gis_area,
        county: prop.county,
        geometry: prop.geometry,
      };
      return acc;
    }, {} as Record<number, PropertyDetails>);
    
    return NextResponse.json(propertyDetails);
    
  } catch (error) {
    console.error('Property details API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property details' },
      { status: 500 }
    );
  }
}
