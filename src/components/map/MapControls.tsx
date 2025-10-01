interface MapControlsProps {
  boundariesOn: boolean;
  setBoundariesOn: (value: boolean | ((prev: boolean) => boolean)) => void;
  showPropertyLabels: boolean;
  setShowPropertyLabels: (
    value: boolean | ((prev: boolean) => boolean)
  ) => void;
}

export default function MapControls({
  boundariesOn,
  setBoundariesOn,
  showPropertyLabels,
  setShowPropertyLabels,
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
      <button
        onClick={() => setBoundariesOn((v) => !v)}
        className={`px-4 py-2 rounded-lg shadow-md text-white ${
          boundariesOn
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        title={
          boundariesOn ? "Hide property boundaries" : "Show property boundaries"
        }
      >
        {boundariesOn ? "Hide Boundaries" : "Show Boundaries"}
      </button>

      {boundariesOn && (
        <button
          onClick={() => setShowPropertyLabels((v) => !v)}
          className={`px-4 py-2 rounded-lg shadow-md text-white ${
            showPropertyLabels
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
          title={
            showPropertyLabels
              ? "Hide property numbers"
              : "Show property numbers"
          }
        >
          {showPropertyLabels ? "Hide Numbers" : "Show Numbers"}
        </button>
      )}
    </div>
  );
}
