"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { usePropertyStore } from "@/stores/propertyStore";
import { useSavedStore } from "@/stores/savedStore";
import { COUNTY_CENTERS } from "@/config/counties";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapData } from "@/hooks/useMapData";
import { useMapControls } from "@/hooks/useMapControls";
import { useMapFeatures } from "@/hooks/useMapFeatures";
import PropertyLabels from "@/components/map/PropertyLabels";
import MapControls from "@/components/map/MapControls";
import LoadingOverlay from "@/components/map/LoadingOverlay";

delete (
  L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: () => void }
)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapProps {
  isDrawerOpen?: boolean;
}

export default function Map({ isDrawerOpen }: MapProps) {
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const { selectedProperties, toggleProperty, county, setLoading } =
    usePropertyStore();
  const { isSaved, savedProperties } = useSavedStore();

  const {
    geojsonData,
    filteredData,
    dataFetched,
    isLoading,
    loadPropertyBoundaries,
    updateFilteredData,
    resetData,
    clearData,
  } = useMapData(county, setLoading);

  const {
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
  } = useMapControls(geojsonData, updateFilteredData);

  const { onEachFeature } = useMapFeatures(
    selectedProperties,
    isSaved,
    toggleProperty
  );

  useEffect(() => {
    resetData();
  }, [county, resetData]);

  useEffect(() => {
    if (map && county && COUNTY_CENTERS[county]) {
      const center = COUNTY_CENTERS[county];
      map.setView(center, 12);
      setCurrentZoom(12);
    }
  }, [map, county, setCurrentZoom]);

  useEffect(() => {
    if (boundariesOn) {
      loadPropertyBoundaries();
    } else {
      clearData();
      setMapReady(true);
    }
  }, [boundariesOn, loadPropertyBoundaries, clearData, setMapReady]);

  useEffect(() => {
    if (map) {
      const timeouts: NodeJS.Timeout[] = [];

      map.invalidateSize();

      timeouts.push(
        setTimeout(() => map.invalidateSize(), 100),
        setTimeout(() => map.invalidateSize(), 200),
        setTimeout(() => map.invalidateSize(), 350)
      );

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [map, isDrawerOpen]);

  useEffect(() => {
    if (!map) return;

    const mapContainer = map.getContainer();
    if (!mapContainer) return;

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(() => {
        map.invalidateSize();
      }, 50);
    });

    resizeObserver.observe(mapContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [map]);

  useEffect(() => {
    if (dataFetched && geojsonData && !isLoading) {
      updateFilteredData(currentZoom);
    }
  }, [dataFetched, geojsonData, currentZoom, updateFilteredData, isLoading]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={COUNTY_CENTERS[county] || COUNTY_CENTERS.burnet}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        ref={setMap}
        className="z-0"
        preferCanvas={true}
        maxZoom={18}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {filteredData && mapReady && currentZoom >= 8 && (
          <>
            <GeoJSON
              key={`${county}-${selectedProperties.length}-${currentZoom}`}
              data={filteredData}
              onEachFeature={(feature, layer) => {
                onEachFeature(
                  feature,
                  layer as L.Layer & {
                    setStyle: (style: L.PathOptions) => void;
                    on: (
                      event: string,
                      handler: (e?: L.LeafletEvent) => void
                    ) => void;
                  }
                );
              }}
              ref={geoJsonLayerRef}
            />

            <PropertyLabels
              filteredData={filteredData}
              showPropertyLabels={showPropertyLabels}
              currentZoom={currentZoom}
              selectedProperties={selectedProperties}
              savedProperties={savedProperties}
              isSaved={isSaved}
              toggleProperty={toggleProperty}
            />
          </>
        )}

        {boundariesOn && currentZoom < 8 && (
          <div className="leaflet-control leaflet-control-custom">
            <div className="bg-white p-2 rounded shadow-md text-sm">
              Zoom in to see property boundaries (zoom level 8+)
              <br />
              Property numbers appear at zoom level 10+
            </div>
          </div>
        )}
      </MapContainer>

      <MapControls
        boundariesOn={boundariesOn}
        setBoundariesOn={setBoundariesOn}
        showPropertyLabels={showPropertyLabels}
        setShowPropertyLabels={setShowPropertyLabels}
      />

      <LoadingOverlay mapReady={mapReady} />
    </div>
  );
}
