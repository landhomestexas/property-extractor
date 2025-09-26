import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface SavedProperty {
  id: number;
  property_id: number;
  created_at: string;
  properties?: {
    id: number;
    prop_id: string;
    owner_name: string | null;
    situs_addr: string | null;
    mail_addr: string | null;
    land_value: number | null;
    mkt_value: number | null;
    gis_area: number | null;
    county: string;
    county_id: number | null;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const county = searchParams.get('county');
    const countyId = searchParams.get('countyId');
    const includeDetails = searchParams.get('includeDetails') === 'true';
    
    let query;
    
    if (countyId) {
      query = supabase
        .from('saved_properties')
        .select(`
          id,
          property_id,
          created_at
          ${includeDetails ? `,
          properties!saved_properties_property_id_fkey!inner (
            id,
            prop_id,
            owner_name,
            situs_addr,
            mail_addr,
            land_value,
            mkt_value,
            gis_area,
            county,
            county_id
          )` : ''}
        `)
        .eq('properties.county_id', parseInt(countyId));
    } else if (county) {
      query = supabase
        .from('saved_properties')
        .select(`
          id,
          property_id,
          created_at
          ${includeDetails ? `,
          properties!saved_properties_property_id_fkey!inner (
            id,
            prop_id,
            owner_name,
            situs_addr,
            mail_addr,
            land_value,
            mkt_value,
            gis_area,
            county,
            county_id
          )` : ''}
        `)
        .eq('properties.county', county);
    } else {
      query = supabase
        .from('saved_properties')
        .select(`
          id,
          property_id,
          created_at
          ${includeDetails ? `,
          properties!saved_properties_property_id_fkey (
            id,
            prop_id,
            owner_name,
            situs_addr,
            mail_addr,
            land_value,
            mkt_value,
            gis_area,
            county,
            county_id
          )` : ''}
        `);
    }

    const { data: savedProperties, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(savedProperties || []);
    
  } catch (error) {
    console.error('Saved properties GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId } = body;
    
    if (!propertyId || typeof propertyId !== 'number') {
      return NextResponse.json(
        { error: 'Valid propertyId is required' },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from('saved_properties')
      .select('id')
      .eq('property_id', propertyId)
      .single();

    if (existing) {
      return NextResponse.json({ 
        ok: true, 
        alreadySaved: true,
        message: 'Property is already saved'
      });
    }

    const { error } = await supabase
      .from('saved_properties')
      .insert({ property_id: propertyId });

    if (error) throw error;

    return NextResponse.json({ 
      ok: true, 
      alreadySaved: false,
      message: 'Property saved successfully'
    });
    
  } catch (error) {
    console.error('Saved properties POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save property' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    
    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('property_id', parseInt(propertyId));

    if (error) throw error;

    return NextResponse.json({ 
      ok: true,
      message: 'Property unsaved successfully'
    });
    
  } catch (error) {
    console.error('Saved properties DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to unsave property' },
      { status: 500 }
    );
  }
}
