import { NextRequest, NextResponse } from 'next/server';
import { getProviderById } from '@/config/skipTraceProviders';
import { parsePropertyData } from '@/utils/propertyDataParser';

const BATCHDATA_BASE_URL = 'https://api.batchdata.com';

interface Property {
  id: number;
  propId: string;
  ownerName: string | null;
  situsAddr: string | null;
  mailAddr: string | null;
  landValue: number | null;
  mktValue: number | null;
  gisArea: number | null;
  county: string;
}

interface BatchDataRequest {
  properties: Property[];
  endpoint?: string;
}

interface BatchDataApiResponse {
  results: BatchDataResult[];
}

interface BatchDataResult {
  propertyId: number;
  [key: string]: unknown;
}

interface SkipTraceResult {
  propertyId: number;
  status: 'completed' | 'failed';
  data?: BatchDataResult;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { properties, endpoint }: BatchDataRequest = await request.json();
    
    const provider = getProviderById('batchdata');
    if (!provider) {
      return NextResponse.json({ error: 'BatchData provider not configured' }, { status: 500 });
    }

    const apiEndpoint = endpoint || provider.endpoint;
    
    const batchRequest = properties.map(property => {
        const parsedData = parsePropertyData(property);
      
      return {
        ...provider.bodyTemplate,
        propertyId: parsedData.propertyId,
        firstName: parsedData.firstName,
        lastName: parsedData.lastName,
        address: parsedData.streetAddress,
        city: parsedData.city,
        state: parsedData.state,
        zip: parsedData.zip
      };
    });

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.BATCHDATA_API_KEY}`
    };

    // console.log(`BatchData API Request for ${properties.length} properties:`, {
    //   url: `${BATCHDATA_BASE_URL}${apiEndpoint}`,
    //   method: provider.method,
    //   headers: headers,
    //   body: { requests: batchRequest }
    // });

    const response = await fetch(`${BATCHDATA_BASE_URL}${apiEndpoint}`, {
      method: provider.method,
      headers: headers,
      body: JSON.stringify({ requests: batchRequest })
    });

    if (response.ok) {
      const data: BatchDataApiResponse = await response.json();
      const results: SkipTraceResult[] = data.results.map((result: BatchDataResult) => ({
        propertyId: result.propertyId,
        status: 'completed' as const,
        data: result
      }));
      return NextResponse.json({ results });
    } else {
      const errorText = await response.text();
      const results: SkipTraceResult[] = properties.map((property: Property) => ({
        propertyId: property.id,
        status: 'failed' as const,
        error: `BatchData API error: ${response.status} - ${errorText}`
      }));
      return NextResponse.json({ results });
    }

  } catch (error) {
    return NextResponse.json({ 
      error: `BatchData processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
