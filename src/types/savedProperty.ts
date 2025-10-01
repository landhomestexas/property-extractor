export interface SavedProperty {
  id: number;
  property_id: number;
  created_at: string;
  user_number: string | null;
  properties?: {
    id: number;
    prop_id: string;
    owner_name: string | null;
    situs_addr: string | null;
    mail_addr: string | null;
    land_value: number | null;
    mkt_value: number | null;
    gis_area: number | null;
    county: string;
    county_id: number | null;
  };
}
