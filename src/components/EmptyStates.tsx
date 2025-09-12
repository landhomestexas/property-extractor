"use client";

import EmptyState from "./EmptyState";

// Property-related empty states
export function NoPropertiesSelected() {
  return (
    <EmptyState
      title="No Properties Selected"
      description="Please select properties from the map first."
      actionText="Go Back to Map"
      actionHref="/"
      icon={
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
      }
    />
  );
}

// Session-related empty states
export function NoSessionsFound() {
  return (
    <EmptyState
      title="No Skip Trace Sessions"
      description="You haven't run any skip trace sessions yet. Select properties and run a skip trace to get started."
      actionText="Start Skip Tracing"
      actionHref="/skip-tracing"
      icon={
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
      }
    />
  );
}

// Search/Results empty states
export function NoResultsFound() {
  return (
    <EmptyState
      title="No Results Found"
      description="We couldn't find any properties matching your search criteria. Try adjusting your filters or search terms."
      actionText="Clear Filters"
      icon={
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      }
    />
  );
}

// Loading/Error states
export function LoadingError() {
  return (
    <EmptyState
      title="Something Went Wrong"
      description="We encountered an error while loading your data. Please try again or contact support if the problem persists."
      actionText="Try Again"
      icon={
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      }
    />
  );
}
