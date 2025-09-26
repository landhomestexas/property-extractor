import { NextRequest, NextResponse } from 'next/server';
import { getProviderByEndpoint } from '@/config/skipTraceProviders';
import { buildPayloadFromTemplate } from '@/utils/payloadBuilder';

const ENFORMION_BASE_URL = 'https://devapi.enformion.com';

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

export async function POST(request: NextRequest) {
  try {
    const { properties, endpoint }: { properties: EditablePropertyData[], endpoint?: string } = await request.json();
    
    const provider = getProviderByEndpoint('enformion', '/Contact/Enrich');
    if (!provider) {
      return NextResponse.json({ error: 'EnformionGo provider not configured' }, { status: 500 });
    }

    const apiEndpoint = endpoint || provider.endpoint;
    const results = [];

    for (const property of properties) {
      try {
        const requestBody = buildPayloadFromTemplate(provider.bodyTemplate, property);

        const headers = {
          'galaxy-ap-name': process.env.ENFORMION_AP_NAME!,
          'galaxy-ap-password': process.env.ENFORMION_AP_PASSWORD!,
          'galaxy-search-type': provider.searchType!,
          'galaxy-client-session-id': `session_${Date.now()}_${property.propertyId}`,
          'galaxy-client-type': provider.clientType!,
          'Content-Type': 'application/json'
        };

        const response = await fetch(`${ENFORMION_BASE_URL}${apiEndpoint}`, {
          method: provider.method,
          headers: headers,
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          const data = await response.json();
          results.push({
            propertyId: property.propertyId,
            status: 'completed',
            data: data
          });
        } else {
          const errorText = await response.text();
          results.push({
            propertyId: property.propertyId,
            status: 'failed',
            error: `EnformionGo API error: ${response.status} - ${errorText}`
          });
        }

      } catch (error) {
        results.push({
          propertyId: property.propertyId,
          status: 'failed',
          error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return NextResponse.json({ results });

  } catch (error) {
    return NextResponse.json({ 
      error: `EnformionGo processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
