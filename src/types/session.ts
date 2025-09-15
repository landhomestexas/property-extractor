export interface Property {
  id: number;
  propId: string;
  ownerName: string | null;
  situsAddr: string | null;
  mailAddr: string | null;
  landValue: number | null;
  mktValue: number | null;
  gisArea: number | null;
  county: string;
}

export interface EditablePropertyData {
  propertyId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface ContactData {
  mobiles: string[];
  landlines: string[];
  emails: string[];
}

export interface SkipTraceSession {
  id: string;
  timestamp: Date;
  provider: string;
  properties: Property[];
  inputData: Record<number, EditablePropertyData>;
  results: Record<number, ContactData>;
  successRate: number;
  totalProperties: number;
}
