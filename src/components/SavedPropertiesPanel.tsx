"use client";

import { useState, useEffect } from "react";
import { useSavedStore } from "@/stores/savedStore";

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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showUnsaveAllModal, setShowUnsaveAllModal] = useState(false);

  const {
    savedProperties,
    isLoading,
    error,
    loadSaved,
    unsave,
    getSavedCount,
    getSavedPropertyIds,
  } = useSavedStore();

  useEffect(() => {
    if (currentCounty || currentCountyId) {
      loadSaved(currentCounty, currentCountyId);
    }
  }, [currentCounty, currentCountyId, loadSaved]);

  const handleUnsave = async (propertyId: number) => {
    const result = await unsave(propertyId);
    if (!result.success) {
      // Could show toast notification here
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

  const handleExport = () => {
    if (selectedIds.size === 0) {
      return; // Don't proceed if no properties are selected
    }

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

  const handleSkipTrace = () => {
    if (selectedIds.size === 0) {
      return; // Don't proceed if no properties are selected
    }

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

  const savedCount = savedProperties.length;

  return (
    <div className="bg-white shadow-sm h-full flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">Saved Properties</h3>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
            {savedCount}
          </span>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          {isCollapsed ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 flex flex-col h-full">
          {isLoading && (
            <div className="text-center py-4 text-gray-500">
              Loading saved properties...
            </div>
          )}

          {error && (
            <div className="text-center py-4 text-red-500">Error: {error}</div>
          )}

          {!isLoading && !error && savedProperties.length > 0 && (
            <>
              {/* Actions Bar */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedIds.size === savedProperties.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  {selectedIds.size > 0 && (
                    <span className="text-sm text-gray-500">
                      ({selectedIds.size} selected)
                    </span>
                  )}
                </div>
                {savedProperties.length > 0 && (
                  <button
                    onClick={handleUnsaveAll}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Unsave All
                  </button>
                )}
              </div>

              {/* Properties List */}
              <div
                className="space-y-2 overflow-y-auto min-h-0"
                style={{ maxHeight: "60vh" }}
              >
                {savedProperties.map((savedProperty) => {
                  const property = savedProperty.properties;
                  if (!property) return null;

                  const isSelected = selectedIds.has(property.id);

                  return (
                    <div
                      key={property.id}
                      className="border rounded p-3 text-sm bg-gray-50 relative cursor-pointer"
                      onClick={() => handleSelectProperty(property.id)}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectProperty(property.id)}
                        className="absolute top-3 left-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Property ID Badge */}
                      <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {property.prop_id}
                      </div>

                      <div className="pl-8 pr-16">
                        <div className="font-medium text-gray-900">
                          {property.owner_name || "Unknown Owner"}
                        </div>
                        <div className="text-gray-600 mt-1">
                          {property.situs_addr || "No address available"}
                        </div>
                        <div className="text-gray-500 mt-1 text-xs">
                          Market Value: $
                          {property.mkt_value?.toLocaleString() || "N/A"}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="absolute bottom-2 right-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsave(property.id);
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove from saved"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-4 flex-shrink-0 border-t border-gray-100 pt-4">
                <button
                  onClick={handleExport}
                  disabled={selectedIds.size === 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    selectedIds.size === 0
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {selectedIds.size === 0
                    ? "Select Properties to Export"
                    : selectedIds.size === 1
                    ? "Export 1 Property to CSV"
                    : `Export ${selectedIds.size} Properties to CSV`}
                </button>

                <button
                  onClick={handleSkipTrace}
                  disabled={selectedIds.size === 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    selectedIds.size === 0
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {selectedIds.size === 0
                    ? "Select Properties for Skip Tracing"
                    : selectedIds.size === 1
                    ? "Skip Trace 1 Property"
                    : `Skip Trace ${selectedIds.size} Properties`}
                </button>
              </div>
            </>
          )}

          {!isLoading && !error && savedProperties.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-2">
                <svg
                  className="w-12 h-12 mx-auto text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </div>
              <p className="text-sm">No saved properties for this county</p>
              <p className="text-xs text-gray-400 mt-1">
                Click the bookmark icon on any property to save it
              </p>
            </div>
          )}
        </div>
      )}

      {/* Unsave All Confirmation Modal */}
      {showUnsaveAllModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white bg-opacity-60 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Unsave All Properties
            </h3>

            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to unsave all {savedProperties.length}{" "}
              properties? This action cannot be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={cancelUnsaveAll}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnsaveAll}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Unsave All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
