import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface ExportableProperty {
  propId: string;
  ownerName: string | null;
  situsAddr: string | null;
  mailAddr: string | null;
  landValue: number | null;
  mktValue: number | null;
  gisArea: number | null;
  county: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',').map(Number) || [];
    const county = searchParams.get('county') || 'Properties';
    
    if (ids.length === 0) {
      return NextResponse.json({ error: 'No property IDs provided' }, { status: 400 });
    }
    
    const { data: rawProperties, error } = await supabase
      .from('properties')
      .select('prop_id, owner_name, situs_addr, mail_addr, land_value, mkt_value, gis_area, county')
      .in('id', ids);

    if (error) throw error;

    const properties: ExportableProperty[] = rawProperties.map(p => ({
      propId: p.prop_id,
      ownerName: p.owner_name,
      situsAddr: p.situs_addr,
      mailAddr: p.mail_addr,
      landValue: p.land_value,
      mktValue: p.mkt_value,
      gisArea: p.gis_area,
      county: p.county,
    }));
    
    const csvHeader = 'Property_ID,Owner_Name,Property_Address,Mailing_Address,Land_Value,Market_Value,Acreage,County\n';
    const csvRows = properties.map((p: ExportableProperty) => [
      p.propId,
      `"${(p.ownerName || '').replace(/"/g, '""')}"`,
      `"${(p.situsAddr || '').replace(/"/g, '""')}"`,
      `"${(p.mailAddr || '').replace(/"/g, '""')}"`,
      p.landValue || 0,
      p.mktValue || 0,
      p.gisArea || 0,
      p.county,
    ].join(',')).join('\n');
    
    const csv = csvHeader + csvRows;
    
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${county}-County-Properties-${dateStr}.csv`;
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
    
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
