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
  county: string;
}

interface PropertyStore {
  selectedProperties: Property[];
  propertyDetails: Record<number, Property>;
  checkedForSkipTrace: Set<number>;
  county: string;
  loading: boolean;
  loadingDetails: boolean;
  
  setCounty: (county: string) => void;
  toggleProperty: (propertyId: number) => Promise<void>;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setLoadingDetails: (loading: boolean) => void;
  cachePropertyDetails: (details: Record<number, Property>) => void;
  toggleSkipTraceCheck: (propertyId: number) => void;
  checkAllForSkipTrace: () => void;
  uncheckAllForSkipTrace: () => void;
  removeProperty: (propertyId: number) => void;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  selectedProperties: [],
  propertyDetails: {},
  checkedForSkipTrace: new Set(),
  county: 'burnet',
  loading: false,
  loadingDetails: false,
  
  setCounty: (county) => set({ county, selectedProperties: [], propertyDetails: {}, checkedForSkipTrace: new Set() }),
  
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
      county: state.county,
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
  
  clearSelection: () => set({ selectedProperties: [], checkedForSkipTrace: new Set() }),
  setLoading: (loading) => set({ loading }),
  setLoadingDetails: (loading) => set({ loadingDetails: loading }),
  cachePropertyDetails: (details) => set(state => ({
    propertyDetails: { ...state.propertyDetails, ...details }
  })),
  
  toggleSkipTraceCheck: (propertyId: number) => set(state => {
    const newChecked = new Set(state.checkedForSkipTrace);
    if (newChecked.has(propertyId)) {
      newChecked.delete(propertyId);
    } else {
      newChecked.add(propertyId);
    }
    return { checkedForSkipTrace: newChecked };
  }),
  
  checkAllForSkipTrace: () => set(state => ({
    checkedForSkipTrace: new Set(state.selectedProperties.map(p => p.id))
  })),
  
  uncheckAllForSkipTrace: () => set({ checkedForSkipTrace: new Set() }),
  
  removeProperty: (propertyId: number) => set(state => {
    const newChecked = new Set(state.checkedForSkipTrace);
    newChecked.delete(propertyId);
    return {
      selectedProperties: state.selectedProperties.filter(p => p.id !== propertyId),
      checkedForSkipTrace: newChecked
    };
  }),
}));
