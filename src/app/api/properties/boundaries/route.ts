import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const county = searchParams.get('county') || 'burnet';
    
    console.log("🔍 API: Fetching boundaries for county:", county);
    
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, prop_id, geometry')
      .eq('county', county)
      .range(0, 99999); // Use range to bypass 1000 record default limit

    if (error) {
      console.error("❌ API: Supabase error:", error);
      throw error;
    }

    console.log("📊 API: Raw database response:", {
      count: properties?.length || 0,
      requestedRange: "0-99999 (bypassing 1000 default limit)",
      hitRangeLimit: properties?.length === 100000 ? "⚠️ YES - might be more data!" : "✅ NO - got all data in range",
      expectedCount: "~50,000 properties",
      sampleProperties: properties?.slice(0, 3).map(p => ({
        id: p.id,
        prop_id: p.prop_id,
        geometryPreview: p.geometry?.substring(0, 100) + "..."
      }))
    });

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
    
    console.log("🗺️ API: Generated GeoJSON:", {
      type: geojson.type,
      featuresCount: geojson.features.length,
      firstFeatureId: geojson.features[0]?.properties?.id,
      firstFeaturePropId: geojson.features[0]?.properties?.propId,
      responseSize: JSON.stringify(geojson).length
    });
    
    return NextResponse.json(geojson);
    
  } catch (error) {
    console.error('❌ Property boundaries API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property boundaries' },
      { status: 500 }
    );
  }
}
