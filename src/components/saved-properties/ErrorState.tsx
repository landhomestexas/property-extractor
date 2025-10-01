interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center text-red-500">Error: {error}</div>
    </div>
  );
}
