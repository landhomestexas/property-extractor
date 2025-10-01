interface UnsaveAllModalProps {
  isOpen: boolean;
  propertyCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function UnsaveAllModal({
  isOpen,
  propertyCount,
  onConfirm,
  onCancel,
}: UnsaveAllModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white bg-opacity-60 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
          Unsave All Properties
        </h3>

        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to unsave all {propertyCount} properties? This
          action cannot be undone.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Unsave All
          </button>
        </div>
      </div>
    </div>
  );
}
