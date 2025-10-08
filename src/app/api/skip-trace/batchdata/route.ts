import { NextRequest, NextResponse } from 'next/server';
import { getProviderById } from '@/config/skipTraceProviders';

const BATCHDATA_BASE_URL = 'https://api.batchdata.com';
interface EditablePropertyData {
  propertyId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface BatchDataRequest {
  properties: EditablePropertyData[];
  endpoint?: string;
}

interface BatchDataPropertyAddress {
  city: string;
  street: string;
  state: string;
  zip: string;
}

interface BatchDataApiRequest {
  requests: Array<{
    propertyAddress: BatchDataPropertyAddress;
  }>;
}

interface BatchDataApiResponse {
  status?: {
    code: number;
    text: string;
  };
  results?: {
    persons?: BatchDataResult[];
    meta?: {
      results?: {
        requestCount: number;
        matchCount: number;
        noMatchCount: number;
        errorCount: number;
      };
      requestId?: string;
      apiVersion?: string;
    };
  };
}

interface BatchDataResult {
  name?: {
    first?: string;
    last?: string;
    middle?: string;
    full?: string;
  };
  phoneNumbers?: Array<{
    number: string;
    type: string;
    carrier?: string;
    tested?: boolean;
    reachable?: boolean;
    dnc?: boolean;
    lastReportedDate?: string;
    score?: number;
  }>;
  emails?: Array<{
    email: string;
    tested?: boolean;
  }>;
  meta?: {
    matched?: boolean;
    error?: boolean;
  };
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

    // Check for API key
    if (!process.env.BATCHDATA_API_KEY) {
      return NextResponse.json({ error: 'BatchData API key not configured. Please set BATCHDATA_API_KEY in your environment variables.' }, { status: 500 });
    }

    const apiEndpoint = endpoint || provider.endpoint;
    
    const batchRequest: BatchDataApiRequest = {
      requests: properties.map(property => {
        const request = JSON.parse(JSON.stringify(provider.bodyTemplate));
        request.propertyAddress.city = property.city || '';
        request.propertyAddress.street = property.street || '';
        request.propertyAddress.state = property.state || '';
        request.propertyAddress.zip = property.zip || '';
        return request;
      })
    };

    const headers = {
      'Accept': 'application/json, application/xml',
      'Authorization': `Bearer ${process.env.BATCHDATA_API_KEY}`,
      'Content-Type': 'application/json'
    };

    const fullUrl = `${BATCHDATA_BASE_URL}${apiEndpoint}`;
    const requestBody = JSON.stringify(batchRequest);

    const response = await fetch(fullUrl, {
      method: provider.method,
      headers: headers,
      body: requestBody
    });

    if (response.ok) {
      const responseText = await response.text();
      
      let data: BatchDataApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ BatchData Response Parse Error:', parseError);
        
      const results: SkipTraceResult[] = properties.map((property: EditablePropertyData) => ({
        propertyId: property.propertyId,
        status: 'failed' as const,
        error: `Failed to parse BatchData response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
      }));
        return NextResponse.json({ results });
      }

      const results: SkipTraceResult[] = properties.map((property, index) => {
        const resultData = data.results?.persons?.[index] || {};
        
        return {
          propertyId: property.propertyId,
          status: 'completed' as const,
          data: resultData
        };
      });
      
      return NextResponse.json({ results });
    } else {
      const errorText = await response.text();
      console.error('❌ BatchData API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        errorBody: errorText,
        url: fullUrl,
        method: provider.method
      });
      
      const results: SkipTraceResult[] = properties.map((property: EditablePropertyData) => ({
        propertyId: property.propertyId,
        status: 'failed' as const,
        error: `BatchData API error: ${response.status} - ${errorText}`
      }));
      return NextResponse.json({ results });
    }

  } catch (error) {
    console.error('❌ BatchData processing failed:', error);
    return NextResponse.json({ 
      error: `BatchData processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
