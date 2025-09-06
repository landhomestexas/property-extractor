"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { usePropertyStore } from "@/stores/propertyStore";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function Map() {
  const [geojsonData, setGeojsonData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(true);
  const [boundariesOn, setBoundariesOn] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(12);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const { selectedProperties, toggleProperty, county, setLoading } =
    usePropertyStore();

  const canvasRenderer = useRef(L.canvas({ padding: 0.5 }));

  const filterPropertiesForZoom = (data: any, zoom: number) => {
    if (!data || !data.features) return null;
    if (zoom < 14) {
      return { type: "FeatureCollection", features: [] };
    }
    return data;
  };

  const loadPropertyBoundaries = async () => {
    setLoading(true);
    setMapReady(false);

    try {
      const response = await fetch(
        `/api/properties/boundaries?county=${county}`
      );
      const data = await response.json();
      setGeojsonData(data);
      const filtered = filterPropertiesForZoom(data, currentZoom);
      setFilteredData(filtered);

      setTimeout(() => {
        setMapReady(true);
        setLoading(false);
      }, 500);
    } catch (error) {
      setLoading(false);
      setMapReady(true);
    }
  };

  const handleMapUpdate = () => {
    if (!map || !geojsonData || !boundariesOn) return;
    const zoom = map.getZoom();
    setCurrentZoom(zoom);
    const filtered = filterPropertiesForZoom(geojsonData, zoom);
    setFilteredData(filtered);
  };

  const debouncedMapUpdate = useRef<NodeJS.Timeout | null>(null);
  const handleMapUpdateDebounced = () => {
    if (debouncedMapUpdate.current) {
      clearTimeout(debouncedMapUpdate.current);
    }
    debouncedMapUpdate.current = setTimeout(handleMapUpdate, 200);
  };

  useEffect(() => {
    if (map) {
      map.on("zoomend", handleMapUpdate);
      map.on("moveend", handleMapUpdateDebounced);

      return () => {
        map.off("zoomend", handleMapUpdate);
        map.off("moveend", handleMapUpdateDebounced);
      };
    }
  }, [map, geojsonData, boundariesOn]);

  useEffect(() => {
    // Load/clear boundaries when toggle or county changes
    if (boundariesOn) {
      loadPropertyBoundaries();
    } else {
      setGeojsonData(null);
      setFilteredData(null);
      setMapReady(true);
    }
  }, [county, boundariesOn]);

  const onEachFeature = (feature: any, layer: any) => {
    const isSelected = selectedProperties.some(
      (p) => p.id === feature.properties.id
    );

    layer.setStyle({
      color: isSelected ? "#ef4444" : "#3b82f6",
      weight: isSelected ? 3 : 1,
      fillOpacity: isSelected ? 0.2 : 0,
      fillColor: isSelected ? "#ef4444" : "#3b82f6",
      opacity: 1,
    });

    layer.on("click", (e: any) => {
      e.originalEvent.preventDefault();
      const newColor = isSelected ? "#3b82f6" : "#ef4444";
      const newWeight = isSelected ? 1 : 3;
      const newFillOpacity = isSelected ? 0 : 0.2;
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
          weight: isSelected ? 3 : 1,
          fillOpacity: isSelected ? 0.2 : 0,
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
        weight: isSelected ? 3 : 1,
        fillOpacity: isSelected ? 0.2 : 0,
        opacity: 1,
      });
    });
  };

  return (
    <div className="relative">
      <MapContainer
        center={[30.756, -98.234]}
        zoom={12}
        style={{ height: "100vh", width: "100%" }}
        ref={setMap}
        className="z-0"
        preferCanvas={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {filteredData && mapReady && currentZoom >= 14 && (
          <GeoJSON
            key={`${county}-${selectedProperties.length}-${currentZoom}`}
            data={filteredData}
            onEachFeature={onEachFeature}
            ref={geoJsonLayerRef}
          />
        )}

        {boundariesOn && currentZoom < 14 && (
          <div className="leaflet-control leaflet-control-custom">
            <div className="bg-white p-2 rounded shadow-md text-sm">
              Zoom in to see property boundaries
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
