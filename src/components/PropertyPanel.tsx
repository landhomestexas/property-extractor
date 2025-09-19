"use client";

import { usePropertyStore } from "@/stores/propertyStore";
import Link from "next/link";

export default function PropertyPanel() {
  const {
    selectedProperties,
    clearSelection,
    county,
    setCounty,
    loading,
    loadingDetails,
  } = usePropertyStore();

  const handleExport = async () => {
    if (selectedProperties.length === 0) return;

    const ids = selectedProperties.map((p) => p.id).join(",");
    const countyName = county.charAt(0).toUpperCase() + county.slice(1); // Capitalize first letter
    window.open(
      `/api/export?ids=${ids}&county=${encodeURIComponent(countyName)}`,
      "_blank"
    );
  };

  return (
    <div className="w-80 bg-white shadow-lg flex flex-col h-screen">
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
            <option value="burnet" className="font-medium text-gray-900">
              📍 Burnet County
            </option>
            <option value="madison" className="font-medium text-gray-900">
              📍 Madison County
            </option>
            <option value="williamson" disabled className="text-gray-400">
              📍 Williamson County (Coming Soon)
            </option>
            <option value="travis" disabled className="text-gray-400">
              📍 Travis County (Coming Soon)
            </option>
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
              {selectedProperties.map((property) => (
                <div
                  key={property.id}
                  className="border rounded p-3 text-sm bg-gray-50"
                >
                  <div className="font-medium text-gray-900">
                    {property.ownerName || "Unknown Owner"}
                  </div>
                  <div className="text-gray-600 mt-1">
                    {property.situsAddr || "No address available"}
                  </div>
                  <div className="text-gray-500 mt-1 text-xs">
                    Land Value: ${property.landValue?.toLocaleString() || "N/A"}{" "}
                    • {property.gisArea?.toFixed(2) || "N/A"} acres
                  </div>
                </div>
              ))}
            </div>

            {/* Export Button */}
            <div className="p-4 border-t space-y-3">
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
    </div>
  );
}
