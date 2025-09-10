import { SkipTraceProvider } from '@/config/skipTraceProviders';

interface Property {
  id: number;
  propId: string;
  ownerName: string | null;
  situsAddr: string | null;
  mailAddr: string | null;
  landValue: number | null;
  mktValue: number | null;
  gisArea: number | null;
}

export function formatSkipTraceRequest(property: Property, provider: SkipTraceProvider) {
  const ownerName = property.ownerName || '';
  const nameParts = ownerName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts[nameParts.length - 1] || '';
  const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

  const address = property.situsAddr || property.mailAddr || '';
  const addressParts = address.split(',');
  const streetAddress = addressParts[0]?.trim() || '';
  const cityStateZip = addressParts.slice(1).join(',').trim() || '';

  if (provider.id === 'enformion') {
    return {
      url: provider.endpoint,
      method: provider.method,
      headers: {
        ...provider.headers,
        'galaxy-client-session-id': `session_${Date.now()}_${property.id}`,
      },
      body: {
        FirstName: firstName,
        MiddleName: middleName,
        LastName: lastName,
        Address: {
          addressLine1: streetAddress,
          addressLine2: cityStateZip
        }
      }
    };
  }

  if (provider.id === 'batchdata') {
    const [city, stateZip] = cityStateZip.split(',').map(s => s.trim());
    const [state, zip] = (stateZip || '').split(' ').filter(Boolean);

    return {
      url: provider.endpoint,
      method: provider.method,
      headers: provider.headers,
      body: {
        firstName: firstName,
        lastName: lastName,
        address: streetAddress,
        city: city || '',
        state: state || '',
        zip: zip || ''
      }
    };
  }

  return null;
}

export function generateSamplePayloads(properties: Property[], provider: SkipTraceProvider) {
  return properties.map(property => ({
    property: {
      id: property.id,
      propId: property.propId,
      owner: property.ownerName,
      address: property.situsAddr
    },
    request: formatSkipTraceRequest(property, provider)
  }));
}
