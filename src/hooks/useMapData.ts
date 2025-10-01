import { useState, useCallback } from "react";
import type { FeatureCollection } from "geojson";
import { filterPropertiesForZoom } from "@/utils/mapUtils";

export const useMapData = (county: string, setLoading: (loading: boolean) => void) => {
  const [geojsonData, setGeojsonData] = useState<FeatureCollection | null>(null);
  const [filteredData, setFilteredData] = useState<FeatureCollection | null>(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadPropertyBoundaries = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      const url = `/api/properties/boundaries?county=${county}&t=${Date.now()}`;

      const response = await fetch(url, {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setGeojsonData(data);
      setDataFetched(true);

      setTimeout(() => {
        setLoading(false);
        setIsLoading(false);
      }, 500);
    } catch (error: unknown) {
      console.error("Failed to load property boundaries:", error);
      setLoading(false);
      setIsLoading(false);
    }
  }, [county, setLoading, isLoading]);

  const updateFilteredData = useCallback((zoom: number) => {
    if (geojsonData) {
      const filtered = filterPropertiesForZoom(geojsonData, zoom);
      setFilteredData(filtered);
    }
  }, [geojsonData]);

  const resetData = useCallback(() => {
    setDataFetched(false);
    setGeojsonData(null);
    setFilteredData(null);
  }, []);

  const clearData = useCallback(() => {
    setGeojsonData(null);
    setFilteredData(null);
  }, []);

  return {
    geojsonData,
    filteredData,
    dataFetched,
    isLoading,
    loadPropertyBoundaries,
    updateFilteredData,
    resetData,
    clearData,
  };
};
