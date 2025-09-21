export interface County {
  id: string;
  name: string;
  displayName: string;
  coordinates: [number, number]; // [latitude, longitude]
  available: boolean;
  icon?: string;
}

export const COUNTIES: Record<string, County> = {
  burnet: {
    id: 'burnet',
    name: 'Burnet County',
    displayName: '📍 Burnet County',
    coordinates: [30.756, -98.234],
    available: true,
  },
  madison: {
    id: 'madison',
    name: 'Madison County',
    displayName: '📍 Madison County',
    coordinates: [30.95, -95.85],
    available: true,
  },
  burleson: {
    id: 'burleson',
    name: 'Burleson County',
    displayName: '📍 Burleson County',
    coordinates: [30.5, -96.6],
    available: true,
  },
};

// Legacy support for existing Map component
export const COUNTY_CENTERS: Record<string, [number, number]> = Object.fromEntries(
  Object.entries(COUNTIES).map(([key, county]) => [key, county.coordinates])
);

export const getCountyCenter = (countyName: string): [number, number] | null => {
  return COUNTIES[countyName]?.coordinates || null;
};

export const getAvailableCounties = (): County[] => {
  return Object.values(COUNTIES).filter(county => county.available);
};

export const getAllCounties = (): County[] => {
  return Object.values(COUNTIES);
};
