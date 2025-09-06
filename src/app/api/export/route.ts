import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',').map(Number) || [];
    
    if (ids.length === 0) {
      return NextResponse.json({ error: 'No property IDs provided' }, { status: 400 });
    }
    
    const properties = await prisma.property.findMany({
      where: { id: { in: ids } },
      select: {
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
    
    const csvHeader = 'Property_ID,Owner_Name,Property_Address,Mailing_Address,Land_Value,Market_Value,Acreage,County\n';
    const csvRows = properties.map(p => [
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
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="properties-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
    
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
