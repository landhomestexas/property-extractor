import { NextRequest, NextResponse } from 'next/server';
import { generateTempUserNumber } from '@/utils/propertyNumbering';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countyId = searchParams.get('countyId');
    const existingTempNumbers = searchParams.get('existingTempNumbers');
    
    if (!countyId) {
      return NextResponse.json(
        { error: 'countyId is required' },
        { status: 400 }
      );
    }

    const existingNumbers = existingTempNumbers ? existingTempNumbers.split(',') : [];
    const tempUserNumber = await generateTempUserNumber(parseInt(countyId), existingNumbers);

    return NextResponse.json({ 
      tempUserNumber
    });
    
  } catch (error) {
    console.error('Temp user number GET error:', error);
    return NextResponse.json(
      { error: 'Failed to generate temporary user number' },
      { status: 500 }
    );
  }
}
