interface ActionButtonsProps {
  selectedCount: number;
  onExport: () => void;
  onSkipTrace: () => void;
}

export default function ActionButtons({
  selectedCount,
  onExport,
  onSkipTrace,
}: ActionButtonsProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-white">
      <div className="space-y-3">
        <button
          onClick={onExport}
          disabled={!hasSelection}
          className={`w-full py-3 px-4 rounded-lg font-medium ${
            !hasSelection
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {!hasSelection
            ? "Select Properties to Export"
            : selectedCount === 1
            ? "Export 1 Property to CSV"
            : `Export ${selectedCount} Properties to CSV`}
        </button>

        <button
          onClick={onSkipTrace}
          disabled={!hasSelection}
          className={`w-full py-3 px-4 rounded-lg font-medium ${
            !hasSelection
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {!hasSelection
            ? "Select Properties for Skip Tracing"
            : selectedCount === 1
            ? "Skip Trace 1 Property"
            : `Skip Trace ${selectedCount} Properties`}
        </button>
      </div>
    </div>
  );
}
