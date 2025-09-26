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

interface EnformionAddressRequest {
  properties: EditablePropertyData[];
  endpoint?: string;
}

interface AddressIdApiResponse {
  person?: {
    name: {
      firstName: string;
      middleName: string;
      lastName: string;
    };
    age: string;
    addresses: unknown[];
    phones: unknown[];
    emails: unknown[];
  };
  persons?: Array<{
    name: {
      firstName: string;
      middleName: string;
      lastName: string;
    };
    age: string;
    addresses: unknown[];
    phones: unknown[];
    emails: unknown[];
  }>;
  pagination: {
    currentPageNumber: number;
    resultsPerPage: number;
    totalPages: number;
    totalResults: number;
  };
  requestId: string;
  requestType: string;
  isError: boolean;
  error: {
    inputErrors: unknown[];
    warnings: unknown[];
  };
}

interface SkipTraceResult {
  propertyId: number;
  status: 'completed' | 'failed';
  data?: unknown;
  error?: string;
  endpointUsed?: string; 
  foundPersonName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { properties, endpoint }: EnformionAddressRequest = await request.json();
    
    const provider = getProviderByEndpoint('enformion', '/Address/Id');
    if (!provider) {
      return NextResponse.json({ error: 'EnformionGo Address ID provider not configured' }, { status: 500 });
    }

    const apiEndpoint = endpoint || provider.endpoint;
    const results: SkipTraceResult[] = [];
    
    for (const propertyData of properties) {
      try {
        const addressPayload = buildPayloadFromTemplate(provider.bodyTemplate, {
          propertyId: propertyData.propertyId,
          firstName: propertyData.firstName,
          middleName: propertyData.middleName,
          lastName: propertyData.lastName,
          street: propertyData.street,
          city: propertyData.city,
          state: propertyData.state,
          zip: propertyData.zip
        });

        const headers = {
          'Content-Type': 'application/json',
          'galaxy-ap-name': process.env.ENFORMION_AP_NAME!,
          'galaxy-ap-password': process.env.ENFORMION_AP_PASSWORD!,
          'galaxy-client-session-id': 'property-extractor-session',
          'galaxy-client-type': provider.clientType!,
          'galaxy-search-type': provider.searchType!
        };
        
        const addressResponse = await fetch(`${ENFORMION_BASE_URL}${apiEndpoint}`, {
          method: provider.method,
          headers: headers,
          body: JSON.stringify(addressPayload)
        });

        if (!addressResponse.ok) {
          const errorText = await addressResponse.text();
          results.push({
            propertyId: propertyData.propertyId,
            status: 'failed',
            error: `Address ID API error: ${addressResponse.status} - ${errorText}`,
            endpointUsed: 'Address ID'
          });
          continue;
        }

        const addressData: AddressIdApiResponse = await addressResponse.json();

        const person = addressData.person || (addressData.persons && addressData.persons.length > 0 ? addressData.persons[0] : null);
        
        if (person) {

          const contactProvider = getProviderByEndpoint('enformion', '/Contact/Enrich');
          
          if (contactProvider) {
            const contactPayload = buildPayloadFromTemplate(contactProvider.bodyTemplate, {
              propertyId: propertyData.propertyId,
              firstName: person.name.firstName,
              middleName: person.name.middleName,
              lastName: person.name.lastName,
              street: propertyData.street,
              city: propertyData.city,
              state: propertyData.state,
              zip: propertyData.zip
            });

            const contactHeaders = {
              ...headers,
              'galaxy-search-type': contactProvider.searchType!
            };

            const contactResponse = await fetch(`${ENFORMION_BASE_URL}${contactProvider.endpoint}`, {
              method: contactProvider.method,
              headers: contactHeaders,
              body: JSON.stringify(contactPayload)
            });

            if (contactResponse.ok) {
              const contactData = await contactResponse.json();
              
              const foundPersonName = `${person.name.firstName} ${person.name.middleName} ${person.name.lastName}`.replace(/\s+/g, ' ').trim();
              
              results.push({
                propertyId: propertyData.propertyId,
                status: 'completed',
                data: contactData,
                endpointUsed: 'Address ID → Contact Enrichment',
                foundPersonName: foundPersonName
              });
            } else {
              results.push({
                propertyId: propertyData.propertyId,
                status: 'completed',
                data: addressData,
                endpointUsed: 'Address ID'
              });
            }
          } else {
            results.push({
              propertyId: propertyData.propertyId,
              status: 'completed',
              data: addressData,
              endpointUsed: 'Address ID'
            });
          }
        } else {
          results.push({
            propertyId: propertyData.propertyId,
            status: 'completed',
            data: addressData,
            endpointUsed: 'Address ID'
          });
        }

      } catch (error) {
        console.error(`Error processing property ${propertyData.propertyId}:`, error);
        results.push({
          propertyId: propertyData.propertyId,
          status: 'failed',
          error: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          endpointUsed: 'Address ID'
        });
      }
    }


    return NextResponse.json({ results });

  } catch (error) {
    console.error('EnformionGo Address ID processing failed:', error);
    return NextResponse.json({ 
      error: `Address ID processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

