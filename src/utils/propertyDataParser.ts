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

export interface ParsedPropertyData {
  propertyId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  fullAddress: string;
  cityStateZip: string;
}

export function parsePropertyData(property: Property): ParsedPropertyData {
  const ownerName = property.ownerName || '';
  const nameParts = ownerName.split(' ').filter(Boolean);
  const firstName = nameParts[0] || '';
  const lastName = nameParts[nameParts.length - 1] || '';
  const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

  const fullAddress = property.situsAddr || property.mailAddr || '';
  const addressParts = fullAddress.split(',').map(s => s.trim());
  const streetAddress = addressParts[0] || '';
  const cityStateZip = addressParts.slice(1).join(', ');
  
  const [city, stateZip] = cityStateZip.split(',').map(s => s.trim());
  const [state, zip] = (stateZip || '').split(' ').filter(Boolean);

  return {
    propertyId: property.id,
    firstName,
    middleName,
    lastName,
    streetAddress,
    city: city || '',
    state: state || '',
    zip: zip || '',
    fullAddress,
    cityStateZip
  };
}
