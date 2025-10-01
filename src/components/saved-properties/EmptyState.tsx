export default function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center text-gray-500">
        <div className="mb-2">
          <svg
            className="w-12 h-12 mx-auto text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
        <p className="text-sm">No saved properties for this county</p>
        <p className="text-xs text-gray-400 mt-1">
          Click the bookmark icon on any property to save it
        </p>
      </div>
    </div>
  );
}
