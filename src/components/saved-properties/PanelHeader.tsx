interface PanelHeaderProps {
  savedCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function PanelHeader({
  savedCount,
  isCollapsed,
  onToggleCollapse,
}: PanelHeaderProps) {
  return (
    <div
      className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
      onClick={onToggleCollapse}
    >
      <div className="flex items-center space-x-2">
        <h3 className="font-medium text-gray-900">Saved Properties</h3>
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
          {savedCount}
        </span>
      </div>
      <button className="text-gray-500 hover:text-gray-700">
        {isCollapsed ? (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
