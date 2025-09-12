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
        default:
          result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}
