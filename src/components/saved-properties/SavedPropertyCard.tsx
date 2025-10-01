import { SavedProperty } from "@/types/savedProperty";

interface SavedPropertyCardProps {
  savedProperty: SavedProperty;
  isSelected: boolean;
  onSelect: (propertyId: number) => void;
  onUnsave: (propertyId: number) => void;
}

export default function SavedPropertyCard({
  savedProperty,
  isSelected,
  onSelect,
  onUnsave,
}: SavedPropertyCardProps) {
  const property = savedProperty.properties;
  if (!property) return null;

  return (
    <div
      className="border rounded p-3 text-sm bg-gray-50 cursor-pointer"
      onClick={() => onSelect(property.id)}
    >
      {/* Header Row with Checkbox and Property Number */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(property.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex-shrink-0">
          {savedProperty.user_number || property.prop_id}
        </div>
      </div>

      {/* Property Details */}
      <div className="space-y-1">
        <div className="font-medium text-gray-900 pr-2">
          {property.owner_name || "Unknown Owner"}
        </div>
        <div className="text-gray-600 pr-2">
          {property.situs_addr || "No address available"}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-gray-500 text-xs">
            Market Value: ${property.mkt_value?.toLocaleString() || "N/A"}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnsave(property.id);
            }}
            className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
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
    </div>
  );
}
