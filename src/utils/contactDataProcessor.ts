interface ContactData {
  mobiles: string[];
  landlines: string[];
  emails: string[];
}

interface Phone {
  type: string;
  number: string;
}

interface Email {
  email: string;
}

interface Person {
  phones?: Phone[];
  emails?: Email[];
}

interface EnformionApiResponse {
  person?: Person;
}

export function processEnformionResponse(apiResponse: EnformionApiResponse): ContactData {
  const person = apiResponse.person || {};
  const phones = person.phones || [];
  const emails = person.emails || [];
  
  const mobiles = phones
    .filter((p) => p.type === 'mobile')
    .map((p) => p.number);
    
  const landlines = phones
    .filter((p) => p.type === 'landline')
    .map((p) => p.number);
    
  const emailList = emails.map((e) => e.email);
  
  return {
    mobiles,
    landlines,
    emails: emailList
  };
}

export function processBatchDataResponse(): ContactData {
  return {
    mobiles: [],
    landlines: [],
    emails: []
  };
}
