import { useState, useCallback, useRef, useEffect } from "react";
import L from "leaflet";
import type { FeatureCollection } from "geojson";

export const useMapControls = (
  geojsonData: FeatureCollection | null,
  updateFilteredData: (zoom: number) => void
) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(true);
  const [boundariesOn, setBoundariesOn] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(12);
  const [showPropertyLabels, setShowPropertyLabels] = useState(false);

  const debouncedMapUpdate = useRef<NodeJS.Timeout | null>(null);

  const handleMapUpdate = useCallback(() => {
    if (!map || !geojsonData || !boundariesOn) return;
    const zoom = map.getZoom();
    setCurrentZoom(zoom);
    updateFilteredData(zoom);
  }, [map, geojsonData, boundariesOn, updateFilteredData]);

  const handleMapUpdateDebounced = useCallback(() => {
    if (debouncedMapUpdate.current) {
      clearTimeout(debouncedMapUpdate.current);
    }
    debouncedMapUpdate.current = setTimeout(handleMapUpdate, 200);
  }, [handleMapUpdate]);

  useEffect(() => {
    if (map) {
      map.on("zoomend", handleMapUpdate);
      map.on("moveend", handleMapUpdateDebounced);

      return () => {
        map.off("zoomend", handleMapUpdate);
        map.off("moveend", handleMapUpdateDebounced);
      };
    }
  }, [map, handleMapUpdate, handleMapUpdateDebounced]);

  return {
    map,
    setMap,
    mapReady,
    setMapReady,
    boundariesOn,
    setBoundariesOn,
    currentZoom,
    setCurrentZoom,
    showPropertyLabels,
    setShowPropertyLabels,
    handleMapUpdate,
  };
};
