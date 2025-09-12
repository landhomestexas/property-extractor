"use client";

import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionText = "Go Back",
  actionHref = "/",
  icon,
}: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {icon && <div className="flex justify-center mb-6">{icon}</div>}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>
        {actionHref && actionText && (
          <Link href={actionHref}>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              {actionText}
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
