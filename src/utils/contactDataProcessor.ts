interface ContactData {
  mobiles: string[];
  landlines: string[];
  emails: string[];
  endpointUsed?: string;
  foundPersonName?: string;
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

interface BatchDataPhone {
  type: string;
  number: string;
}

interface BatchDataEmail {
  email: string;
}

interface BatchDataPerson {
  name?: string;
  phoneNumbers?: BatchDataPhone[];
  emails?: BatchDataEmail[];
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

export function processBatchDataResponse(apiResponse: unknown): ContactData {
  console.log('🔍 BatchData Response Processor - Raw Input:', {
    responseType: typeof apiResponse,
    isNull: apiResponse === null,
    isUndefined: apiResponse === undefined,
    keys: apiResponse && typeof apiResponse === 'object' ? Object.keys(apiResponse) : 'N/A',
    hasName: !!(apiResponse as BatchDataPerson)?.name,
    hasPhoneNumbers: !!(apiResponse as BatchDataPerson)?.phoneNumbers,
    hasEmails: !!(apiResponse as BatchDataPerson)?.emails,
    fullResponse: apiResponse
  });

  const mobiles: string[] = [];
  const landlines: string[] = [];
  const emails: string[] = [];

  try {
    if (!apiResponse || typeof apiResponse !== 'object') {
      return { mobiles, landlines, emails };
    }
    
    const person = apiResponse as BatchDataPerson;

    if (person.phoneNumbers && Array.isArray(person.phoneNumbers)) {      
      person.phoneNumbers.forEach((phone: BatchDataPhone) => {        
        if (phone.number) {
          if (phone.type === 'Mobile') {
            mobiles.push(phone.number);
          } else if (phone.type === 'Land Line') {
            landlines.push(phone.number);
          } else {
            console.log(`❓ Unknown phone type: ${phone.type} for ${phone.number}`);
          }
        } else {
          console.log(`⚠️ Phone object missing number:`, phone);
        }
      });
    } else {
      console.log('⚠️ No phoneNumbers array found or not an array:', person.phoneNumbers);
    }

    if (person.emails && Array.isArray(person.emails)) {      
      person.emails.forEach((emailObj: BatchDataEmail) => {
        
        if (emailObj.email) {
          emails.push(emailObj.email);
        } else {
          console.log(`⚠️ Email object missing email field:`, emailObj);
        }
      });
    } else {
      console.log('⚠️ No emails array found or not an array:', person.emails);
    }

  } catch (error) {
    console.error('❌ Error processing BatchData response:', error);
    console.error('❌ Error details:', error);
  }

  return {
    mobiles,
    landlines,
    emails
  };
}
