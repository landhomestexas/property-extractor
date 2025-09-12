interface ContactData {
  mobiles: string[];
  landlines: string[];
  emails: string[];
}

export function processEnformionResponse(apiResponse: any): ContactData {
  const person = apiResponse.person || {};
  const phones = person.phones || [];
  const emails = person.emails || [];
  
  const mobiles = phones
    .filter((p: any) => p.type === 'mobile')
    .map((p: any) => p.number);
    
  const landlines = phones
    .filter((p: any) => p.type === 'landline')
    .map((p: any) => p.number);
    
  const emailList = emails.map((e: any) => e.email);
  
  return {
    mobiles,
    landlines,
    emails: emailList
  };
}

export function processBatchDataResponse(apiResponse: any): ContactData {
  return {
    mobiles: [],
    landlines: [],
    emails: []
  };
}
