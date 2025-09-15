"use client";

import dynamic from "next/dynamic";
import PropertyPanel from "@/components/PropertyPanel";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function HomePage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 relative">
        <Map />

        {/* Page Info */}
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-50">
          <h3 className="font-semibold text-gray-800 text-sm">
            Property Extractor
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Click &quot;Show Boundaries&quot; to start selecting properties
          </p>
        </div>
      </div>
      <PropertyPanel />
    </div>
  );
}
