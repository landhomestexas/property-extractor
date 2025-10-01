interface Property {
  id: number;
  propId: string;
  ownerName: string | null;
  situsAddr: string | null;
  landValue: number | null;
  gisArea: number | null;
  tempUserNumber?: string | null;
}

interface SavedProperty {
  property_id: number;
  user_number: string | null;
}

interface PropertyCardProps {
  property: Property;
  isPropertySaved: boolean;
  savedProperties: SavedProperty[];
  onSave: (propertyId: number) => void;
  onUnsave: (propertyId: number) => void;
}

export default function PropertyCard({
  property,
  isPropertySaved,
  savedProperties,
  onSave,
  onUnsave,
}: PropertyCardProps) {
  const getUserNumber = () => {
    if (isPropertySaved) {
      return (
        savedProperties.find((sp) => sp.property_id === property.id)
          ?.user_number ||
        property.tempUserNumber ||
        property.propId
      );
    }
    return property.tempUserNumber || property.propId;
  };

  return (
    <div className="border rounded p-3 text-sm bg-gray-50 relative">
      {/* Property Number Badge */}
      <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
        {getUserNumber()}
      </div>

      {/* Bookmark Icon */}
      <button
        onClick={() =>
          isPropertySaved ? onUnsave(property.id) : onSave(property.id)
        }
        className={`absolute bottom-2 right-2 p-1 transition-colors ${
          isPropertySaved
            ? "text-yellow-500 hover:text-yellow-600"
            : "text-gray-400 hover:text-yellow-500"
        }`}
        title={isPropertySaved ? "Remove from saved" : "Save property"}
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
          Land Value: ${property.landValue?.toLocaleString() || "N/A"} •{" "}
          {property.gisArea?.toFixed(2) || "N/A"} acres
        </div>
      </div>
    </div>
  );
}
