"use client";

import { usePropertyStore } from "@/stores/propertyStore";
import { useSavedStore } from "@/stores/savedStore";
import { usePropertyActions } from "@/hooks/usePropertyActions";
import { useToast } from "@/hooks/useToast";

// Sub-components
import CountySelector from "@/components/property-panel/CountySelector";
import SaveReminder from "@/components/property-panel/SaveReminder";
import PropertyCard from "@/components/property-panel/PropertyCard";
import ActionButtons from "@/components/property-panel/ActionButtons";
import Toast from "@/components/property-panel/Toast";

export default function PropertyPanel() {
  const {
    selectedProperties,
    clearSelection,
    county,
    setCounty,
    loading,
    loadingDetails,
  } = usePropertyStore();

  const { isSaved, savedProperties } = useSavedStore();
  const { handleSaveProperty, handleUnsaveProperty, handleSaveAll } =
    usePropertyActions();
  const { toastMessage, showToast } = useToast();

  const handleExport = async () => {
    if (selectedProperties.length === 0) return;

    const ids = selectedProperties.map((p) => p.id).join(",");
    const countyName = county.charAt(0).toUpperCase() + county.slice(1);
    window.open(
      `/api/export?ids=${ids}&county=${encodeURIComponent(countyName)}`,
      "_blank"
    );
  };

  const onSaveProperty = async (propertyId: number) => {
    const result = await handleSaveProperty(propertyId);
    showToast(result.message);
  };

  const onUnsaveProperty = async (propertyId: number) => {
    const result = await handleUnsaveProperty(propertyId);
    showToast(result.message);
  };

  const onSaveAll = async () => {
    showToast("Saving properties...");
    const result = await handleSaveAll(selectedProperties);
    showToast(result.message);
  };

  return (
    <div className="w-80 lg:w-80 md:w-72 sm:w-64 bg-white shadow-lg flex flex-col h-full max-h-screen overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          Property Extractor
        </h1>

        <CountySelector county={county} setCounty={setCounty} />

        {/* Selection Counter */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Selected ({selectedProperties.length})
          </h2>
          {selectedProperties.length > 0 && (
            <button
              onClick={clearSelection}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {loading && (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-pulse">Loading property boundaries...</div>
            <div className="text-xs mt-2">
              Map interactions disabled until ready...
            </div>
          </div>
        )}

        {loadingDetails && (
          <div className="p-4 text-center text-blue-500">
            <div className="animate-pulse">Loading property details...</div>
          </div>
        )}

        {!loading && selectedProperties.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm">
            Click on properties on the map to select them like checkboxes.
          </div>
        ) : (
          <>
            <SaveReminder
              show={selectedProperties.some((p) => !isSaved(p.id))}
            />

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selectedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isPropertySaved={isSaved(property.id)}
                  savedProperties={savedProperties}
                  onSave={onSaveProperty}
                  onUnsave={onUnsaveProperty}
                />
              ))}
            </div>

            <ActionButtons
              selectedProperties={selectedProperties}
              onSaveAll={onSaveAll}
              onExport={handleExport}
            />
          </>
        )}
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
