import { create } from 'zustand';

interface SavedProperty {
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

interface SavedStore {
  savedIds: Set<number>;
  savedProperties: SavedProperty[];
  isLoading: boolean;
  error: string | null;
  
  loadSaved: (county?: string, countyId?: number) => Promise<void>;
  save: (propertyId: number) => Promise<{ success: boolean; alreadySaved?: boolean; message?: string }>;
  unsave: (propertyId: number) => Promise<{ success: boolean; message?: string }>;
  isSaved: (propertyId: number) => boolean;
  clearSaved: () => void;
  getSavedCount: () => number;
  getSavedPropertyIds: () => number[];
}

export const useSavedStore = create<SavedStore>((set, get) => ({
  savedIds: new Set<number>(),
  savedProperties: [],
  isLoading: false,
  error: null,

  loadSaved: async (county?: string, countyId?: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const params = new URLSearchParams();
      if (countyId) {
        params.append('countyId', countyId.toString());
      } else if (county) {
        params.append('county', county);
      }
      params.append('includeDetails', 'true');

      const response = await fetch(`/api/saved?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved properties');
      }

      const savedProperties: SavedProperty[] = await response.json();
      const savedIds = new Set(savedProperties.map(sp => sp.property_id));

      set({
        savedProperties,
        savedIds,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading saved properties:', error);
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  save: async (propertyId: number) => {
    const currentIds = get().savedIds;
    const newIds = new Set(currentIds);
    newIds.add(propertyId);
    set({ savedIds: newIds });

    try {
      const response = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to save property');
      }

      const result = await response.json();
      
      const state = get();
      if (state.savedProperties.length > 0) {
        const currentCounty = state.savedProperties[0]?.properties?.county;
        if (currentCounty) {
          get().loadSaved(currentCounty);
        }
      }
      
      return {
        success: true,
        alreadySaved: result.alreadySaved,
        message: result.message,
      };
    } catch (error) {
      const revertIds = new Set(currentIds);
      revertIds.delete(propertyId);
      set({ savedIds: revertIds });
      
      console.error('Error saving property:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save property',
      };
    }
  },

  unsave: async (propertyId: number) => {
    const currentIds = get().savedIds;
    const newIds = new Set(currentIds);
    newIds.delete(propertyId);
    
    const currentProperties = get().savedProperties;
    const newProperties = currentProperties.filter(sp => sp.property_id !== propertyId);
    
    set({ 
      savedIds: newIds,
      savedProperties: newProperties,
    });

    try {
      const response = await fetch(`/api/saved?propertyId=${propertyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unsave property');
      }

      const result = await response.json();
      
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      const revertIds = new Set(currentIds);
      revertIds.add(propertyId);
      set({ 
        savedIds: revertIds,
        savedProperties: currentProperties,
      });
      
      console.error('Error unsaving property:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unsave property',
      };
    }
  },

  isSaved: (propertyId: number) => {
    return get().savedIds.has(propertyId);
  },

  clearSaved: () => {
    set({
      savedIds: new Set<number>(),
      savedProperties: [],
      error: null,
    });
  },

  getSavedCount: () => {
    return get().savedIds.size;
  },

  getSavedPropertyIds: () => {
    return Array.from(get().savedIds);
  },
}));
