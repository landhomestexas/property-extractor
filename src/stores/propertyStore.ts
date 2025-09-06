import { create } from 'zustand';

interface Property {
  id: number;
  propId: string;
  ownerName: string | null;
  situsAddr: string | null;
  mailAddr: string | null;
  landValue: number | null;
  mktValue: number | null;
  gisArea: number | null;
}

interface PropertyStore {
  selectedProperties: Property[];
  propertyDetails: Record<number, Property>;
  county: string;
  loading: boolean;
  loadingDetails: boolean;
  
  setCounty: (county: string) => void;
  toggleProperty: (propertyId: number) => Promise<void>;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setLoadingDetails: (loading: boolean) => void;
  cachePropertyDetails: (details: Record<number, Property>) => void;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  selectedProperties: [],
  propertyDetails: {},
  county: 'burnet',
  loading: false,
  loadingDetails: false,
  
  setCounty: (county) => set({ county, selectedProperties: [], propertyDetails: {} }),
  
  toggleProperty: async (propertyId: number) => {
    const state = get();
    const isSelected = state.selectedProperties.some(p => p.id === propertyId);
    
    if (isSelected) {
      set({
        selectedProperties: state.selectedProperties.filter(p => p.id !== propertyId)
      });
      return;
    }
    
    let propertyDetails = state.propertyDetails[propertyId];
    
    if (propertyDetails) {
      set(state => ({
        selectedProperties: [...state.selectedProperties, propertyDetails]
      }));
      return;
    }
    
    const placeholder: Property = {
      id: propertyId,
      propId: `Loading-${propertyId}`,
      ownerName: 'Loading...',
      situsAddr: 'Loading...',
      mailAddr: null,
      landValue: null,
      mktValue: null,
      gisArea: null,
    };
    
    set(state => ({
      selectedProperties: [...state.selectedProperties, placeholder],
      loadingDetails: true,
    }));
    try {
      const response = await fetch(`/api/properties/details?ids=${propertyId}`);
      const details = await response.json();
      propertyDetails = details[propertyId];
      
      if (propertyDetails) {
        set(state => ({
          selectedProperties: state.selectedProperties.map(p => 
            p.id === propertyId ? propertyDetails : p
          ),
          propertyDetails: { ...state.propertyDetails, [propertyId]: propertyDetails },
          loadingDetails: false,
        }));
      }
    } catch (error) {
      set(state => ({
        selectedProperties: state.selectedProperties.filter(p => p.id !== propertyId),
        loadingDetails: false,
      }));
      throw error;
    }
  },
  
  clearSelection: () => set({ selectedProperties: [] }),
  setLoading: (loading) => set({ loading }),
  setLoadingDetails: (loading) => set({ loadingDetails: loading }),
  cachePropertyDetails: (details) => set(state => ({
    propertyDetails: { ...state.propertyDetails, ...details }
  })),
}));
