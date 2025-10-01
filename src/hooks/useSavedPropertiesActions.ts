import { useState } from "react";
import { useSavedStore } from "@/stores/savedStore";

export const useSavedPropertiesActions = () => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showUnsaveAllModal, setShowUnsaveAllModal] = useState(false);
  const { savedProperties, unsave } = useSavedStore();

  const handleUnsave = async (propertyId: number) => {
    const result = await unsave(propertyId);
    if (!result.success) {
      console.error("Failed to unsave property:", result.message);
    }
  };

  const handleUnsaveAll = () => {
    if (savedProperties.length === 0) return;
    setShowUnsaveAllModal(true);
  };

  const confirmUnsaveAll = async () => {
    setShowUnsaveAllModal(false);
    for (const savedProperty of savedProperties) {
      if (savedProperty.properties) {
        await unsave(savedProperty.properties.id);
      }
    }
  };

  const cancelUnsaveAll = () => {
    setShowUnsaveAllModal(false);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === savedProperties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(savedProperties.map((sp) => sp.property_id)));
    }
  };

  const handleSelectProperty = (propertyId: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId);
    } else {
      newSelected.add(propertyId);
    }
    setSelectedIds(newSelected);
  };

  const handleExport = (currentCounty?: string, onExportSaved?: (propertyIds: number[]) => void) => {
    if (selectedIds.size === 0) return;

    const idsToExport = Array.from(selectedIds);

    if (onExportSaved) {
      onExportSaved(idsToExport);
    } else {
      const ids = idsToExport.join(",");
      const countyName = currentCounty
        ? currentCounty.charAt(0).toUpperCase() + currentCounty.slice(1)
        : "Unknown";
      window.open(
        `/api/export?ids=${ids}&county=${encodeURIComponent(countyName)}`,
        "_blank"
      );
    }
  };

  const handleSkipTrace = (currentCounty?: string, onSkipTraceSaved?: (propertyIds: number[]) => void) => {
    if (selectedIds.size === 0) return;

    const idsToTrace = Array.from(selectedIds);

    if (onSkipTraceSaved) {
      onSkipTraceSaved(idsToTrace);
    } else {
      localStorage.setItem("skipTracePropertyIds", JSON.stringify(idsToTrace));
      if (currentCounty) {
        localStorage.setItem("skipTraceCounty", currentCounty);
      }
      window.location.href = "/skip-tracing";
    }
  };

  return {
    selectedIds,
    showUnsaveAllModal,
    handleUnsave,
    handleUnsaveAll,
    confirmUnsaveAll,
    cancelUnsaveAll,
    handleSelectAll,
    handleSelectProperty,
    handleExport,
    handleSkipTrace,
  };
};
