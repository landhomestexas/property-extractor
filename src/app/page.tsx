"use client";

import dynamic from "next/dynamic";
import PropertyPanel from "@/components/PropertyPanel";
import SavedPropertiesPanel from "@/components/SavedPropertiesPanel";
import { usePropertyStore } from "@/stores/propertyStore";
import { useSavedStore } from "@/stores/savedStore";
import { useEffect, useState } from "react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function HomePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const { county } = usePropertyStore();
  const { loadSaved } = useSavedStore();

  useEffect(() => {
    if (county) {
      loadSaved(county);
    }
  }, [county, loadSaved]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Drawer - Saved Properties */}
      <div
        className={`${
          isDrawerOpen ? "w-80 bg-gray-50" : "w-0"
        } transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <SavedPropertiesPanel currentCounty={county} />
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <Map isDrawerOpen={isDrawerOpen} />

        {/* Drawer Toggle Button */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-lg z-50 hover:bg-gray-50 transition-colors"
          title={
            isDrawerOpen ? "Hide saved properties" : "Show saved properties"
          }
        >
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
              isDrawerOpen ? "rotate-0" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Page Info */}
        <div className="absolute top-16 left-4 bg-white p-3 rounded-lg shadow-lg z-50">
          <p className="text-xs text-gray-600">
            Click &quot;Show Boundaries&quot; to start selecting properties
            <br />
            Property numbers appear at zoom level 10+
          </p>
          <div className="mt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border-2 border-blue-500 bg-blue-100"></div>
              <span>Default</span>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <div className="w-3 h-3 border-2 border-yellow-500 bg-yellow-100"></div>
              <span>Saved</span>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <div className="w-3 h-3 border-2 border-red-500 bg-red-100"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Property Panel */}
      <PropertyPanel />
    </div>
  );
}
