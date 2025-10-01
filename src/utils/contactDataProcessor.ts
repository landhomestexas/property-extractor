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
            console.error(`❓ Unknown phone type: ${phone.type} for ${phone.number}`);
          }
        } else {
          console.error(`⚠️ Phone object missing number:`, phone);
        }
      });
    } else {
      console.error('⚠️ No phoneNumbers array found or not an array:', person.phoneNumbers);
    }

    if (person.emails && Array.isArray(person.emails)) {      
      person.emails.forEach((emailObj: BatchDataEmail) => {
        
        if (emailObj.email) {
          emails.push(emailObj.email);
        } else {
          console.error(`⚠️ Email object missing email field:`, emailObj);
        }
      });
    } else {
      console.error('⚠️ No emails array found or not an array:', person.emails);
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
