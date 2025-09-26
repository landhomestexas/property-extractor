import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const county = searchParams.get('county');
    const countyId = searchParams.get('countyId');
    
    const defaultCounty = 'burnet';
    
    let query = supabase
      .from('properties')
      .select('id, prop_id, owner_name, situs_addr, mail_addr, land_value, mkt_value, gis_area, geometry, county, county_id')
      .range(0, 99999); 
    
    if (countyId) {
      query = query.eq('county_id', parseInt(countyId));
    } else {
      const countyFilter = county || defaultCounty;
      query = query.eq('county', countyFilter);
    }
    
    const { data: properties, error } = await query;

    if (error) throw error;

    const geojson = {
      type: "FeatureCollection",
      features: properties.map((prop) => ({
        type: "Feature",
        properties: {
          id: prop.id,
          propId: prop.prop_id,
          ownerName: prop.owner_name,
          situsAddr: prop.situs_addr,
          mailAddr: prop.mail_addr,
          landValue: prop.land_value,
          mktValue: prop.mkt_value,
          gisArea: prop.gis_area,
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
