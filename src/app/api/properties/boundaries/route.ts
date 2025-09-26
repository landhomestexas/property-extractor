import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const county = searchParams.get('county') || 'burnet';
        
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, prop_id, geometry')
      .eq('county', county)
      .range(0, 99999); 

    if (error) {
      console.error("❌ API: Supabase error:", error);
      throw error;
    }

    const geojson = {
      type: "FeatureCollection",
      features: properties.map((prop) => ({
        type: "Feature",
        properties: {
          id: prop.id,
          propId: prop.prop_id,
        },
        geometry: JSON.parse(prop.geometry),
      })),
    };
    
    return NextResponse.json(geojson);
    
  } catch (error) {
    console.error('❌ Property boundaries API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property boundaries' },
      { status: 500 }
    );
  }
}
