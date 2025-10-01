"use client";

import { useState, useEffect } from "react";
import { useSavedStore } from "@/stores/savedStore";
import { useSavedPropertiesActions } from "@/hooks/useSavedPropertiesActions";

// Sub-components
import PanelHeader from "@/components/saved-properties/PanelHeader";
import ActionsBar from "@/components/saved-properties/ActionsBar";
import SavedPropertyCard from "@/components/saved-properties/SavedPropertyCard";
import ActionButtons from "@/components/saved-properties/ActionButtons";
import UnsaveAllModal from "@/components/saved-properties/UnsaveAllModal";
import EmptyState from "@/components/saved-properties/EmptyState";
import LoadingState from "@/components/saved-properties/LoadingState";
import ErrorState from "@/components/saved-properties/ErrorState";

interface SavedPropertiesPanelProps {
  currentCounty?: string;
  currentCountyId?: number;
  onExportSaved?: (propertyIds: number[]) => void;
  onSkipTraceSaved?: (propertyIds: number[]) => void;
}

export default function SavedPropertiesPanel({
  currentCounty,
  currentCountyId,
  onExportSaved,
  onSkipTraceSaved,
}: SavedPropertiesPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { savedProperties, isLoading, error, loadSaved } = useSavedStore();

  const {
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
  } = useSavedPropertiesActions();

  useEffect(() => {
    if (currentCounty || currentCountyId) {
      loadSaved(currentCounty, currentCountyId);
    }
  }, [currentCounty, currentCountyId, loadSaved]);

  const savedCount = savedProperties.length;

  return (
    <div className="bg-white shadow-sm h-full flex flex-col">
      <PanelHeader
        savedCount={savedCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <div className="flex flex-col h-full">
          {isLoading && <LoadingState />}
          {error && <ErrorState error={error} />}

          {!isLoading && !error && savedProperties.length > 0 && (
            <>
              <ActionsBar
                selectedCount={selectedIds.size}
                totalCount={savedProperties.length}
                onSelectAll={handleSelectAll}
                onUnsaveAll={handleUnsaveAll}
              />

              <div className="flex-1 overflow-y-auto p-4 pt-2">
                <div className="space-y-2">
                  {savedProperties.map((savedProperty) => (
                    <SavedPropertyCard
                      key={savedProperty.property_id}
                      savedProperty={savedProperty}
                      isSelected={selectedIds.has(savedProperty.property_id)}
                      onSelect={handleSelectProperty}
                      onUnsave={handleUnsave}
                    />
                  ))}
                </div>
              </div>

              <ActionButtons
                selectedCount={selectedIds.size}
                onExport={() => handleExport(currentCounty, onExportSaved)}
                onSkipTrace={() =>
                  handleSkipTrace(currentCounty, onSkipTraceSaved)
                }
              />
            </>
          )}

          {!isLoading && !error && savedProperties.length === 0 && (
            <EmptyState />
          )}
        </div>
      )}

      <UnsaveAllModal
        isOpen={showUnsaveAllModal}
        propertyCount={savedProperties.length}
        onConfirm={confirmUnsaveAll}
        onCancel={cancelUnsaveAll}
      />
    </div>
  );
}
