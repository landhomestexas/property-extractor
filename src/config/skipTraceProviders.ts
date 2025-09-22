export interface SkipTraceProvider {
  provider_id: string;
  name: string;
  costPerSearch: string;
  description: string;
  endpoint: string;
  method: string;
  searchType?: string;
  clientType?: string;
  bodyTemplate: Record<string, unknown>;
}

export const SKIP_TRACE_PROVIDERS: SkipTraceProvider[] = [
  {
    provider_id: 'batchdata',
    name: 'BatchData',
    costPerSearch: '$0.25',
    description: 'Currently disabled - pending documentation review',
    endpoint: '/v1/skip-trace',
    method: 'POST',
    bodyTemplate: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      zip: ''
    }
  },
  {
    provider_id: 'enformion',
    name: 'TruePeopleSearch - Contact Enrichment',
    costPerSearch: '$0.10',
    description: 'Skip trace using a person\'s name and address',
    endpoint: '/Contact/Enrich',
    method: 'POST',
    searchType: 'DevAPIContactEnrich',
    clientType: 'Galaxy Client Type',
    bodyTemplate: {
      FirstName: '',
      MiddleName: '',
      LastName: '',
      Address: {
        addressLine1: '',
        addressLine2: ''
      }
    }
  },
  {
    provider_id: 'enformion',
    name: 'TruePeopleSearch - Address ID',
    costPerSearch: '$0.05',
    description: 'Skip trace using address only (auto-chains to Contact Enrichment if person found)',
    endpoint: '/Address/Id',
    method: 'POST',
    searchType: 'DevAPIAddressID',
    clientType: 'Galaxy Client Type',
    bodyTemplate: {
      addressLine1: '',
      addressLine2: ''
    }
  }
];

export const getProviderById = (provider_id: string): SkipTraceProvider | undefined => {
  return SKIP_TRACE_PROVIDERS.find(provider => provider.provider_id === provider_id);
};

export const getProviderByEndpoint = (provider_id: string, endpoint: string): SkipTraceProvider | undefined => {
  return SKIP_TRACE_PROVIDERS.find(provider => 
    provider.provider_id === provider_id && provider.endpoint === endpoint
  );
};
