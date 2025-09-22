"use client";

import { SkipTraceSession } from "@/types/session";

interface SessionHeaderProps {
  session: SkipTraceSession;
  viewMode: "input" | "results";
  onViewModeChange: (mode: "input" | "results") => void;
  onExport: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

export default function SessionHeader({
  session,
  viewMode,
  onViewModeChange,
  onExport,
  onDelete,
}: SessionHeaderProps) {
  const formatDateTime = (date: Date) => {
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h3 className="font-semibold text-gray-800">
          Session {session.id.split("_")[1]} ({session.provider})
        </h3>
        <span className="text-sm text-gray-600">
          {formatDateTime(session.timestamp)}
        </span>
        <span className="text-sm text-gray-600">
          {session.totalProperties}{" "}
          {session.totalProperties === 1 ? "property" : "properties"}
        </span>
        <span
          className={`text-sm font-medium cursor-help ${
            session.successRate >= 70
              ? "text-green-600"
              : session.successRate >= 40
              ? "text-yellow-600"
              : "text-red-600"
          }`}
          title="Success rate of skip traced properties"
        >
          {session.successRate}% success
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("input")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === "input"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Input
          </button>
          <button
            onClick={() => onViewModeChange("results")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === "results"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Results
          </button>
        </div>

        <button
          onClick={() => onExport(session.id)}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Export
        </button>

        <button
          onClick={() => onDelete(session.id)}
          className="text-red-500 hover:text-red-700"
          title="Delete session"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
