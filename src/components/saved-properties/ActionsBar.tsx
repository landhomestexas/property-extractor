interface ActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onUnsaveAll: () => void;
}

export default function ActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onUnsaveAll,
}: ActionsBarProps) {
  return (
    <div className="flex items-center justify-between p-4 pb-2 border-b border-gray-100 flex-shrink-0">
      <div className="flex items-center space-x-2">
        <button
          onClick={onSelectAll}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {selectedCount === totalCount ? "Deselect All" : "Select All"}
        </button>
        {selectedCount > 0 && (
          <span className="text-sm text-gray-500">
            ({selectedCount} selected)
          </span>
        )}
      </div>
      {totalCount > 0 && (
        <button
          onClick={onUnsaveAll}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Unsave All
        </button>
      )}
    </div>
  );
}
