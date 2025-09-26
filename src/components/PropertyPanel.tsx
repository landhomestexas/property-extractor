"use client";

import { usePropertyStore } from "@/stores/propertyStore";
import { useSavedStore } from "@/stores/savedStore";
import { getAllCounties } from "@/config/counties";
import Link from "next/link";
import { useState } from "react";

export default function PropertyPanel() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    selectedProperties,
    clearSelection,
    county,
    setCounty,
    loading,
    loadingDetails,
  } = usePropertyStore();

  const { save, unsave, isSaved } = useSavedStore();

  const counties = getAllCounties();

  const handleExport = async () => {
    if (selectedProperties.length === 0) return;

    const ids = selectedProperties.map((p) => p.id).join(",");
    const countyName = county.charAt(0).toUpperCase() + county.slice(1); // Capitalize first letter
    window.open(
      `/api/export?ids=${ids}&county=${encodeURIComponent(countyName)}`,
      "_blank"
    );
  };

  const handleSaveProperty = async (propertyId: number) => {
    const result = await save(propertyId);

    if (result.success) {
      if (result.alreadySaved) {
        showToast("Property is already saved");
      } else {
        showToast("Property saved successfully");
      }
    } else {
      showToast(result.message || "Failed to save property");
    }
  };

  const handleUnsaveProperty = async (propertyId: number) => {
    const result = await unsave(propertyId);

    if (result.success) {
      showToast("Property removed from saved");
    } else {
      showToast(result.message || "Failed to unsave property");
    }
  };

  const handleSaveAll = async () => {
    if (selectedProperties.length === 0) return;

    showToast("Saving properties...");
    let savedCount = 0;
    let alreadySavedCount = 0;
    let errorCount = 0;

    for (const property of selectedProperties) {
      const result = await save(property.id);
      if (result.success) {
        if (result.alreadySaved) {
          alreadySavedCount++;
        } else {
          savedCount++;
        }
      } else {
        errorCount++;
      }
    }

    if (errorCount === 0) {
      if (alreadySavedCount === selectedProperties.length) {
        showToast("All properties were already saved");
      } else if (savedCount > 0 && alreadySavedCount > 0) {
        showToast(
          `${savedCount} properties saved, ${alreadySavedCount} were already saved`
        );
      } else {
        showToast(`${savedCount} properties saved successfully`);
      }
    } else {
      showToast(`${savedCount} saved, ${errorCount} failed`);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="w-80 lg:w-80 md:w-72 sm:w-64 bg-white shadow-lg flex flex-col h-full max-h-screen overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          Property Extractor
        </h1>

        {/* County Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            County
          </label>
          <select
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="w-full border-2 border-blue-300 rounded-lg px-4 py-3 pr-12 bg-white text-gray-900 font-medium shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 16px center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "16px",
            }}
          >
            {counties.map((countyData) => (
              <option
                key={countyData.id}
                value={countyData.id}
                disabled={!countyData.available}
                className={
                  countyData.available
                    ? "font-medium text-gray-900"
                    : "text-gray-400"
                }
              >
                {countyData.displayName}
              </option>
            ))}
          </select>
        </div>

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
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selectedProperties.map((property) => {
                const isPropertySaved = isSaved(property.id);

                return (
                  <div
                    key={property.id}
                    className="border rounded p-3 text-sm bg-gray-50 relative"
                  >
                    {/* Property ID Badge */}
                    <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {property.propId}
                    </div>

                    {/* Bookmark Icon */}
                    <button
                      onClick={() =>
                        isPropertySaved
                          ? handleUnsaveProperty(property.id)
                          : handleSaveProperty(property.id)
                      }
                      className={`absolute bottom-2 right-2 p-1 transition-colors ${
                        isPropertySaved
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-gray-400 hover:text-yellow-500"
                      }`}
                      title={
                        isPropertySaved ? "Remove from saved" : "Save property"
                      }
                    >
                      <svg
                        className="w-4 h-4"
                        fill={isPropertySaved ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>

                    <div className="pr-16">
                      <div className="font-medium text-gray-900">
                        {property.ownerName || "Unknown Owner"}
                      </div>
                      <div className="text-gray-600 mt-1">
                        {property.situsAddr || "No address available"}
                      </div>
                      <div className="text-gray-500 mt-1 text-xs">
                        Land Value: $
                        {property.landValue?.toLocaleString() || "N/A"} •{" "}
                        {property.gisArea?.toFixed(2) || "N/A"} acres
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t space-y-3">
              <button
                onClick={handleSaveAll}
                disabled={selectedProperties.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-medium ${
                  selectedProperties.length === 0
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-yellow-600 text-white hover:bg-yellow-700"
                }`}
              >
                {selectedProperties.length === 0
                  ? "Select Properties to Save"
                  : selectedProperties.length === 1
                  ? "Save 1 Property"
                  : `Save All ${selectedProperties.length} Properties`}
              </button>

              <button
                onClick={handleExport}
                disabled={selectedProperties.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-medium ${
                  selectedProperties.length === 0
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {selectedProperties.length === 0
                  ? "Select Properties to Export"
                  : selectedProperties.length === 1
                  ? "Export 1 Property to CSV"
                  : `Export ${selectedProperties.length} Properties to CSV`}
              </button>

              <Link href="/skip-tracing">
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    selectedProperties.length === 0
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  style={{
                    pointerEvents:
                      selectedProperties.length === 0 ? "none" : "auto",
                  }}
                >
                  {selectedProperties.length === 0
                    ? "Select Properties for Skip Tracing"
                    : selectedProperties.length === 1
                    ? "Skip Trace Selected Property →"
                    : `Skip Trace ${selectedProperties.length} Properties →`}
                </button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
