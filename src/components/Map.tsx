"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker } from "react-leaflet";
import { usePropertyStore } from "@/stores/propertyStore";
import { useSavedStore } from "@/stores/savedStore";
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

interface MapProps {
  isDrawerOpen?: boolean;
}

export default function Map({ isDrawerOpen }: MapProps) {
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
  const [showPropertyLabels, setShowPropertyLabels] = useState(true);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const { selectedProperties, toggleProperty, county, setLoading } =
    usePropertyStore();
  const { isSaved } = useSavedStore();

  const createNumberedIcon = (
    propId: string,
    isSelected: boolean,
    isSavedProperty: boolean
  ) => {
    const backgroundColor = isSelected
      ? "#ef4444"
      : isSavedProperty
      ? "#eab308"
      : "#3b82f6";
    const textColor = "#ffffff";

    const minWidth = 32;
    const charWidth = 8;
    const calculatedWidth = Math.max(minWidth, propId.length * charWidth + 12);

    return L.divIcon({
      html: `<div style="
        background-color: ${backgroundColor};
        color: ${textColor};
        min-width: ${calculatedWidth}px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.25);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 0 6px;
        white-space: nowrap;
      ">${propId}</div>`,
      className: "property-label",
      iconSize: [calculatedWidth, 24],
      iconAnchor: [calculatedWidth / 2, 12],
    });
  };

  const calculateCentroid = (geometry: GeoJSON.Geometry): [number, number] => {
    if (geometry.type === "Polygon") {
      const coords = geometry.coordinates[0];
      let x = 0,
        y = 0;
      const numPoints = coords.length - 1;

      for (let i = 0; i < numPoints; i++) {
        x += coords[i][0];
        y += coords[i][1];
      }

      const centroid: [number, number] = [y / numPoints, x / numPoints];
      return centroid;
    }
    if (geometry.type === "MultiPolygon") {
      const coords = geometry.coordinates[0][0];
      let x = 0,
        y = 0;
      const numPoints = coords.length - 1;

      for (let i = 0; i < numPoints; i++) {
        x += coords[i][0];
        y += coords[i][1];
      }

      const centroid: [number, number] = [y / numPoints, x / numPoints];
      return centroid;
    }
    return [0, 0];
  };

  const filterPropertiesForZoom = useCallback(
    (
      data: FeatureCollection | null,
      zoom: number
    ): FeatureCollection | null => {
      if (!data || !data.features) return null;

      if (zoom >= 10) {
        return data;
      }

      const maxProperties = zoom >= 8 ? 1000 : zoom >= 6 ? 500 : 200;
      const filteredFeatures = data.features.slice(0, maxProperties);

      return {
        ...data,
        features: filteredFeatures,
      };
    },
    []
  );

  const loadPropertyBoundaries = useCallback(async () => {
    if (isLoading) {
      return;
    }

    if (dataFetched && geojsonData) {
      const filtered = filterPropertiesForZoom(geojsonData, currentZoom);
      setFilteredData(filtered);
      return;
    }

    setIsLoading(true);
    setLoading(true);
    setMapReady(false);

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

      const filtered = filterPropertiesForZoom(data, currentZoom);
      setFilteredData(filtered);

      setTimeout(() => {
        setMapReady(true);
        setLoading(false);
        setIsLoading(false);
      }, 500);
    } catch (error: unknown) {
      console.error("Failed to load property boundaries:", error);
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
    setDataFetched(false);
    setGeojsonData(null);
    setFilteredData(null);
  }, [county]);

  useEffect(() => {
    if (map && county && COUNTY_CENTERS[county]) {
      const center = COUNTY_CENTERS[county];
      map.setView(center, 12);
      setCurrentZoom(12);
    }
  }, [map, county]);

  useEffect(() => {
    if (map) {
      const timeouts: NodeJS.Timeout[] = [];

      map.invalidateSize();

      timeouts.push(
        setTimeout(() => {
          map.invalidateSize();
        }, 100)
      );

      timeouts.push(
        setTimeout(() => {
          map.invalidateSize();
        }, 200)
      );

      timeouts.push(
        setTimeout(() => {
          map.invalidateSize();
        }, 350)
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
    const isPropertySaved = isSaved(feature.properties.id);

    let color = "#3b82f6";
    let fillColor = "#3b82f6";
    let weight = 2;
    let fillOpacity = 0.1;

    if (isPropertySaved && !isSelected) {
      color = "#eab308";
      fillColor = "#eab308";
      weight = 2;
      fillOpacity = 0.15;
    }

    if (isSelected) {
      color = "#ef4444";
      fillColor = "#ef4444";
      weight = 3;
      fillOpacity = 0.2;
    }

    layer.setStyle({
      color,
      weight,
      fillOpacity,
      fillColor,
      opacity: 1,
    });

    layer.on("click", (e: L.LeafletMouseEvent) => {
      e.originalEvent.preventDefault();

      const newIsSelected = !isSelected;
      let newColor = "#3b82f6";
      let newFillColor = "#3b82f6";
      let newWeight = 2;
      let newFillOpacity = 0.1;

      if (isPropertySaved && !newIsSelected) {
        newColor = "#eab308";
        newFillColor = "#eab308";
        newWeight = 2;
        newFillOpacity = 0.15;
      }

      if (newIsSelected) {
        newColor = "#ef4444";
        newFillColor = "#ef4444";
        newWeight = 3;
        newFillOpacity = 0.2;
      }

      layer.setStyle({
        color: newColor,
        weight: newWeight,
        fillOpacity: newFillOpacity,
        fillColor: newFillColor,
        opacity: 1,
      });

      toggleProperty(feature.properties.id).catch(() => {
        layer.setStyle({
          color,
          weight,
          fillOpacity,
          fillColor,
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
        weight,
        fillOpacity,
        opacity: 1,
      });
    });
  };

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

            {/* Property Labels */}
            {(() => {
              if (!showPropertyLabels || currentZoom < 10) {
                return null;
              }

              const markers = filteredData.features
                .map((feature) => {
                  if (!feature.properties) {
                    return null;
                  }

                  const centroid = calculateCentroid(feature.geometry);
                  if (centroid[0] === 0 && centroid[1] === 0) {
                    return null;
                  }

                  const isSelected = selectedProperties.some(
                    (p) => p.id === feature.properties!.id
                  );
                  const isPropertySaved = isSaved(feature.properties!.id);

                  return (
                    <Marker
                      key={`label-${feature.properties.id}`}
                      position={centroid}
                      icon={createNumberedIcon(
                        feature.properties.propId,
                        isSelected,
                        isPropertySaved
                      )}
                      eventHandlers={{
                        click: () => {
                          toggleProperty(feature.properties!.id).catch(
                            () => {}
                          );
                        },
                      }}
                    />
                  );
                })
                .filter(Boolean);

              return markers;
            })()}
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

      <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
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

        {boundariesOn && (
          <button
            onClick={() => setShowPropertyLabels((v) => !v)}
            className={`px-4 py-2 rounded-lg shadow-md text-white ${
              showPropertyLabels
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-600 hover:bg-gray-700"
            }`}
            title={
              showPropertyLabels
                ? "Hide property numbers"
                : "Show property numbers"
            }
          >
            {showPropertyLabels ? "Hide Numbers" : "Show Numbers"}
          </button>
        )}
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
