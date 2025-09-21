"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { usePropertyStore } from "@/stores/propertyStore";
import { COUNTY_CENTERS } from "@/config/counties";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FeatureCollection } from "geojson";

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

export default function Map() {
  const [geojsonData, setGeojsonData] = useState<FeatureCollection | null>(
    null
  );
  const [filteredData, setFilteredData] = useState<FeatureCollection | null>(
    null
  );
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(true);
  const [boundariesOn, setBoundariesOn] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(12);
  const [dataFetched, setDataFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const { selectedProperties, toggleProperty, county, setLoading } =
    usePropertyStore();

  const filterPropertiesForZoom = useCallback(
    (
      data: FeatureCollection | null,
      zoom: number
    ): FeatureCollection | null => {
      if (!data || !data.features) return null;

      if (zoom >= 10) {
        console.log(
          `🎯 Showing all ${data.features.length} properties at zoom ${zoom}`
        );
        return data;
      }

      console.log(
        `🎯 Showing all ${data.features.length} properties at zoom ${zoom} (all zoom levels)`
      );
      return data;
    },
    []
  );

  const loadPropertyBoundaries = useCallback(async () => {
    if (isLoading) {
      console.log("⏸️ Already loading data, skipping request");
      return;
    }

    if (dataFetched && geojsonData) {
      console.log("✅ Data already cached, applying zoom filter only");
      const filtered = filterPropertiesForZoom(geojsonData, currentZoom);
      setFilteredData(filtered);
      console.log("🎯 Applied zoom filter:", {
        originalCount: geojsonData.features?.length || 0,
        filteredCount: filtered?.features?.length || 0,
        zoomLevel: currentZoom,
      });
      return;
    }

    console.log("🔄 Loading property boundaries for county:", county);
    setIsLoading(true);
    setLoading(true);
    setMapReady(false);

    try {
      const url = `/api/properties/boundaries?county=${county}&t=${Date.now()}`;
      console.log("📡 Fetching from URL:", url);

      const response = await fetch(url, {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 Raw API response structure:", {
        type: data.type,
        featuresCount: data.features?.length || 0,
        dataSize: JSON.stringify(data).length,
      });

      setGeojsonData(data);
      setDataFetched(true);

      const filtered = filterPropertiesForZoom(data, currentZoom);
      console.log("🎯 Filtered data for zoom level", currentZoom, ":", {
        originalCount: data.features?.length || 0,
        filteredCount: filtered?.features?.length || 0,
      });
      setFilteredData(filtered);

      setTimeout(() => {
        setMapReady(true);
        setLoading(false);
        setIsLoading(false);
        console.log(
          "✅ Map ready with",
          filtered?.features?.length || 0,
          "features"
        );
      }, 500);
    } catch (error: unknown) {
      console.error("❌ Failed to load property boundaries:", error);
      setLoading(false);
      setIsLoading(false);
      setMapReady(true);
    }
  }, [
    county,
    currentZoom,
    filterPropertiesForZoom,
    setLoading,
    isLoading,
    dataFetched,
    geojsonData,
  ]);

  const handleMapUpdate = useCallback(() => {
    if (!map || !geojsonData || !boundariesOn) return;
    const zoom = map.getZoom();
    setCurrentZoom(zoom);

    console.log(
      "🔄 Zoom changed to:",
      zoom,
      "- applying filter to cached data"
    );
    const filtered = filterPropertiesForZoom(geojsonData, zoom);
    setFilteredData(filtered);
  }, [map, geojsonData, boundariesOn, filterPropertiesForZoom]);

  const debouncedMapUpdate = useRef<NodeJS.Timeout | null>(null);
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

  useEffect(() => {
    console.log("🔄 County changed to:", county, "- resetting cache");
    setDataFetched(false);
    setGeojsonData(null);
    setFilteredData(null);
  }, [county]);

  useEffect(() => {
    if (map && county && COUNTY_CENTERS[county]) {
      const center = COUNTY_CENTERS[county];
      console.log(`🗺️ Centering map on ${county} county:`, center);
      map.setView(center, 12);
    }
  }, [map, county]);

  useEffect(() => {
    if (boundariesOn) {
      loadPropertyBoundaries();
    } else {
      setGeojsonData(null);
      setFilteredData(null);
      setMapReady(true);
    }
  }, [boundariesOn, loadPropertyBoundaries]);

  const onEachFeature = (
    feature: { properties: { id: number } },
    layer: L.Layer & {
      setStyle: (style: L.PathOptions) => void;
      on: (event: string, handler: (e?: L.LeafletEvent) => void) => void;
    }
  ) => {
    const isSelected = selectedProperties.some(
      (p) => p.id === feature.properties.id
    );

    layer.setStyle({
      color: isSelected ? "#ef4444" : "#3b82f6",
      weight: isSelected ? 3 : 2,
      fillOpacity: isSelected ? 0.2 : 0.1,
      fillColor: isSelected ? "#ef4444" : "#3b82f6",
      opacity: 1,
    });

    layer.on("click", (e: L.LeafletMouseEvent) => {
      e.originalEvent.preventDefault();
      const newColor = isSelected ? "#3b82f6" : "#ef4444";
      const newWeight = isSelected ? 2 : 3;
      const newFillOpacity = isSelected ? 0.1 : 0.2;
      layer.setStyle({
        color: newColor,
        weight: newWeight,
        fillOpacity: newFillOpacity,
        fillColor: newColor,
        opacity: 1,
      });

      toggleProperty(feature.properties.id).catch(() => {
        layer.setStyle({
          color: isSelected ? "#ef4444" : "#3b82f6",
          weight: isSelected ? 3 : 2,
          fillOpacity: isSelected ? 0.2 : 0.1,
          fillColor: isSelected ? "#ef4444" : "#3b82f6",
          opacity: 1,
        });
      });
    });

    layer.on("mouseover", () => {
      layer.setStyle({
        weight: 3,
        opacity: 1,
      });
    });

    layer.on("mouseout", () => {
      layer.setStyle({
        weight: isSelected ? 3 : 2,
        fillOpacity: isSelected ? 0.2 : 0.1,
        opacity: 1,
      });
    });
  };

  return (
    <div className="relative">
      <MapContainer
        center={COUNTY_CENTERS[county] || COUNTY_CENTERS.burnet}
        zoom={12}
        style={{ height: "100vh", width: "100%" }}
        ref={setMap}
        className="z-0"
        preferCanvas={true}
        maxZoom={18}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {filteredData && mapReady && currentZoom >= 8 && (
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
        )}

        {boundariesOn && currentZoom < 8 && (
          <div className="leaflet-control leaflet-control-custom">
            <div className="bg-white p-2 rounded shadow-md text-sm">
              Zoom in to see property boundaries (zoom level 8+)
            </div>
          </div>
        )}
      </MapContainer>

      <div className="absolute top-24 left-4 z-50 flex items-center space-x-2">
        <button
          onClick={() => setBoundariesOn((v) => !v)}
          className={`px-4 py-2 rounded-lg shadow-md text-white ${
            boundariesOn
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          title={
            boundariesOn
              ? "Hide property boundaries"
              : "Show property boundaries"
          }
        >
          {boundariesOn ? "Hide Boundaries" : "Show Boundaries"}
        </button>
      </div>

      {!mapReady && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-semibold text-gray-800">
              Loading Property Boundaries
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Please wait, map will be interactive shortly...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
