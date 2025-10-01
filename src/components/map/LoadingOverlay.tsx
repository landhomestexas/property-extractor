interface LoadingOverlayProps {
  mapReady: boolean;
}

export default function LoadingOverlay({ mapReady }: LoadingOverlayProps) {
  if (mapReady) return null;

  return (
    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg font-semibold text-gray-800">
          Loading Property Boundaries
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Please wait, map will be interactive shortly...
        </div>
      </div>
    </div>
  );
}
