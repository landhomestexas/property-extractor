import Link from "next/link";

interface Property {
  id: number;
}

interface ActionButtonsProps {
  selectedProperties: Property[];
  onSaveAll: () => void;
  onExport: () => void;
}

export default function ActionButtons({
  selectedProperties,
  onSaveAll,
  onExport,
}: ActionButtonsProps) {
  const propertyCount = selectedProperties.length;
  const hasProperties = propertyCount > 0;

  return (
    <div className="p-4 border-t space-y-3">
      <button
        onClick={onSaveAll}
        disabled={!hasProperties}
        className={`w-full py-3 px-4 rounded-lg font-medium ${
          !hasProperties
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
            : "bg-yellow-600 text-white hover:bg-yellow-700"
        }`}
      >
        {!hasProperties
          ? "Select Properties to Save"
          : propertyCount === 1
          ? "Save 1 Property"
          : `Save All ${propertyCount} Properties`}
      </button>

      <button
        onClick={onExport}
        disabled={!hasProperties}
        className={`w-full py-3 px-4 rounded-lg font-medium ${
          !hasProperties
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {!hasProperties
          ? "Select Properties to Export"
          : propertyCount === 1
          ? "Export 1 Property to CSV"
          : `Export ${propertyCount} Properties to CSV`}
      </button>

      <Link href="/skip-tracing">
        <button
          className={`w-full py-3 px-4 rounded-lg font-medium ${
            !hasProperties
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
          style={{
            pointerEvents: !hasProperties ? "none" : "auto",
          }}
        >
          {!hasProperties
            ? "Select Properties for Skip Tracing"
            : propertyCount === 1
            ? "Skip Trace Selected Property →"
            : `Skip Trace ${propertyCount} Properties →`}
        </button>
      </Link>
    </div>
  );
}
