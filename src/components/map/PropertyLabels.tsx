import { Marker } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import { calculateCentroid, createNumberedIcon } from "@/utils/mapUtils";

interface Property {
  id: number;
  tempUserNumber?: string | null;
}

interface SavedProperty {
  property_id: number;
  user_number: string | null;
}

interface PropertyLabelsProps {
  filteredData: FeatureCollection;
  showPropertyLabels: boolean;
  currentZoom: number;
  selectedProperties: Property[];
  savedProperties: SavedProperty[];
  isSaved: (propertyId: number) => boolean;
  toggleProperty: (propertyId: number) => Promise<void>;
}

export default function PropertyLabels({
  filteredData,
  showPropertyLabels,
  currentZoom,
  selectedProperties,
  savedProperties,
  isSaved,
  toggleProperty,
}: PropertyLabelsProps) {
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

      // Only show labels for clicked or saved properties
      if (!isSelected && !isPropertySaved) {
        return null;
      }

      // Get user number if property is saved, or temp user number if selected
      const savedProperty = savedProperties.find(
        (sp) => sp.property_id === feature.properties!.id
      );
      const selectedProperty = selectedProperties.find(
        (p) => p.id === feature.properties!.id
      );
      const userNumber =
        savedProperty?.user_number || selectedProperty?.tempUserNumber;

      return (
        <Marker
          key={`label-${feature.properties.id}`}
          position={centroid}
          icon={createNumberedIcon(
            feature.properties.propId,
            isSelected,
            isPropertySaved,
            userNumber
          )}
          eventHandlers={{
            click: () => {
              toggleProperty(feature.properties!.id).catch(() => {});
            },
          }}
        />
      );
    })
    .filter(Boolean);

  return <>{markers}</>;
}
