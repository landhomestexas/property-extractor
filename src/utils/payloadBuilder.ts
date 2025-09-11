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

export function buildPayloadFromTemplate(
  template: any, 
  propertyData: EditablePropertyData
): any {
  if (!template || typeof template !== 'object') {
    return template;
  }

  if (Array.isArray(template)) {
    return template.map(item => buildPayloadFromTemplate(item, propertyData));
  }

  const result: any = {};
  
  for (const [key, value] of Object.entries(template)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = buildPayloadFromTemplate(value, propertyData);
    } else if (typeof value === 'string') {
      // Map template fields to actual data
      switch (key) {
        case 'FirstName':
          result[key] = propertyData.firstName;
          break;
        case 'MiddleName':
          result[key] = propertyData.middleName;
          break;
        case 'LastName':
          result[key] = propertyData.lastName;
          break;
        case 'addressLine1':
          result[key] = propertyData.street;
          break;
        case 'addressLine2':
          result[key] = `${propertyData.city}, ${propertyData.state} ${propertyData.zip}`.trim();
          break;
        case 'firstName':
          result[key] = propertyData.firstName;
          break;
        case 'lastName':
          result[key] = propertyData.lastName;
          break;
        case 'address':
          result[key] = propertyData.street;
          break;
        case 'city':
          result[key] = propertyData.city;
          break;
        case 'state':
          result[key] = propertyData.state;
          break;
        case 'zip':
          result[key] = propertyData.zip;
          break;
        default:
          result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}
