"use client";

import { useState } from "react";
import { SkipTraceSession } from "@/types/session";
import SessionHeader from "./SessionHeader";
import SessionInputTable from "./SessionInputTable";
import SessionResultsTable from "./SessionResultsTable";

interface SessionCardProps {
  session: SkipTraceSession;
  onExport: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

export default function SessionCard({
  session,
  onExport,
  onDelete,
}: SessionCardProps) {
  const [viewMode, setViewMode] = useState<"input" | "results">("results");

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      <SessionHeader
        session={session}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={onExport}
        onDelete={onDelete}
      />

      {viewMode === "input" ? (
        <SessionInputTable
          properties={session.properties}
          inputData={session.inputData}
        />
      ) : (
        <SessionResultsTable
          properties={session.properties}
          results={session.results}
        />
      )}
    </div>
  );
}
