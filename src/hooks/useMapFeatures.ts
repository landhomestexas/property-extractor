import { useCallback } from "react";
import L from "leaflet";
import { getPropertyStyle } from "@/utils/mapUtils";

interface Property {
  id: number;
}

export const useMapFeatures = (
  selectedProperties: Property[],
  isSaved: (propertyId: number) => boolean,
  toggleProperty: (propertyId: number) => Promise<void>
) => {
  const onEachFeature = useCallback((
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

    const style = getPropertyStyle(isSelected, isPropertySaved);
    layer.setStyle(style);

    layer.on("click", (e: L.LeafletMouseEvent) => {
      e.originalEvent.preventDefault();

      const newIsSelected = !isSelected;
      const newStyle = getPropertyStyle(newIsSelected, isPropertySaved);
      
      layer.setStyle(newStyle);

      toggleProperty(feature.properties.id).catch(() => {
        layer.setStyle(style);
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
        weight: style.weight,
        fillOpacity: style.fillOpacity,
        opacity: 1,
      });
    });
  }, [selectedProperties, isSaved, toggleProperty]);

  return { onEachFeature };
};
