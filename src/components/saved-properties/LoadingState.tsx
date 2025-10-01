interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading saved properties...",
}: LoadingStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center text-gray-500">{message}</div>
    </div>
  );
}
