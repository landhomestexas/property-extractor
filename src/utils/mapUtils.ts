import L from "leaflet";
import type { FeatureCollection } from "geojson";

export const calculateCentroid = (geometry: GeoJSON.Geometry): [number, number] => {
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

export const filterPropertiesForZoom = (
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
};

export const createNumberedIcon = (
  propId: string,
  isSelected: boolean,
  isSavedProperty: boolean,
  userNumber?: string | null
) => {
  const backgroundColor = isSelected
    ? "#ef4444"
    : isSavedProperty
    ? "#eab308"
    : "#3b82f6";
  const textColor = "#ffffff";

  const displayText = userNumber || propId;
  const minWidth = 32;
  const charWidth = 8;
  const calculatedWidth = Math.max(
    minWidth,
    displayText.length * charWidth + 12
  );

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
    ">${displayText}</div>`,
    className: "property-label",
    iconSize: [calculatedWidth, 24],
    iconAnchor: [calculatedWidth / 2, 12],
  });
};

export const getPropertyStyle = (
  isSelected: boolean,
  isPropertySaved: boolean
): L.PathOptions => {
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

  return {
    color,
    weight,
    fillOpacity,
    fillColor,
    opacity: 1,
  };
};
