interface SaveReminderProps {
  show: boolean;
}

export default function SaveReminder({ show }: SaveReminderProps) {
  if (!show) return null;

  return (
    <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <svg
          className="w-5 h-5 text-amber-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <div className="text-sm text-amber-800">
          <div className="font-medium">
            Do not forget to save your properties!
          </div>
          <div className="text-xs mt-1">
            Unsaved properties will be lost when you leave this page.
          </div>
        </div>
      </div>
    </div>
  );
}
