"use client";

import { useState, useEffect } from "react";
import { usePropertyStore } from "@/stores/propertyStore";
import {
  SKIP_TRACE_PROVIDERS,
  getProviderById,
} from "@/config/skipTraceProviders";
import { generateSamplePayloads } from "@/utils/skipTraceFormatter";
import Link from "next/link";

interface SkipTraceResult {
  propertyId: number;
  status: "waiting" | "processing" | "completed" | "failed";
  phone?: string;
  email?: string;
  additionalContacts?: string[];
  error?: string;
}

export default function SkipTracingPage() {
  const {
    selectedProperties,
    checkedForSkipTrace,
    toggleSkipTraceCheck,
    removeProperty,
  } = usePropertyStore();
  const [skipTraceResults, setSkipTraceResults] = useState<
    Record<number, SkipTraceResult>
  >({});
  const [selectedProvider, setSelectedProvider] = useState("batchdata");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  const checkedProperties = selectedProperties.filter((p) =>
    checkedForSkipTrace.has(p.id)
  );

  useEffect(() => {
    const initialResults: Record<number, SkipTraceResult> = {};
    selectedProperties.forEach((property) => {
      initialResults[property.id] = {
        propertyId: property.id,
        status: "waiting",
      };
    });
    setSkipTraceResults(initialResults);
    setProgress({ completed: 0, total: selectedProperties.length });
  }, [selectedProperties]);

  const handleSkipTraceAll = async () => {
    if (checkedProperties.length === 0) return;

    setIsProcessing(true);
    const provider = getProviderById(selectedProvider);

    if (!provider) {
      console.error("Provider not found");
      setIsProcessing(false);
      return;
    }

    // Generate sample payloads for preview
    const samplePayloads = generateSamplePayloads(checkedProperties, provider);
    console.log("Skip Trace Requests that would be sent:");
    console.log(JSON.stringify(samplePayloads, null, 2));

    for (const property of checkedProperties) {
      setSkipTraceResults((prev) => ({
        ...prev,
        [property.id]: { ...prev[property.id], status: "processing" },
      }));

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockResult: SkipTraceResult = {
        propertyId: property.id,
        status: Math.random() > 0.2 ? "completed" : "failed",
        phone: Math.random() > 0.3 ? "(512) 555-0123" : undefined,
        email: Math.random() > 0.4 ? "owner@example.com" : undefined,
        additionalContacts:
          Math.random() > 0.6 ? ["Spouse: (512) 555-0124"] : undefined,
        error: Math.random() > 0.8 ? "No contact information found" : undefined,
      };

      setSkipTraceResults((prev) => ({
        ...prev,
        [property.id]: mockResult,
      }));

      setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
    }

    setIsProcessing(false);
  };

  const handleRetryProperty = async (propertyId: number) => {
    setSkipTraceResults((prev) => ({
      ...prev,
      [propertyId]: { ...prev[propertyId], status: "processing" },
    }));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockResult: SkipTraceResult = {
      propertyId,
      status: "completed",
      phone: "(512) 555-0199",
      email: "retry@example.com",
    };

    setSkipTraceResults((prev) => ({
      ...prev,
      [propertyId]: mockResult,
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return "⏳";
      case "processing":
        return "🔄";
      case "completed":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "⏳";
    }
  };

  const completedCount = Object.values(skipTraceResults).filter(
    (r) => r.status === "completed"
  ).length;
  const failedCount = Object.values(skipTraceResults).filter(
    (r) => r.status === "failed"
  ).length;

  const handleExportEnhanced = () => {
    const csvData = checkedProperties.map((property) => {
      const result = skipTraceResults[property.id];
      return {
        "Property ID": property.propId,
        "Owner Name": property.ownerName || "",
        "Property Address": property.situsAddr || "",
        "Mailing Address": property.mailAddr || "",
        "Land Value": property.landValue || 0,
        "Market Value": property.mktValue || 0,
        Acreage: property.gisArea || 0,
        "Skip Trace Status": result?.status || "waiting",
        Phone: result?.phone || "",
        Email: result?.email || "",
        "Additional Contacts": result?.additionalContacts?.join("; ") || "",
        Notes: result?.error || "",
      };
    });

    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skip-traced-properties-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selectedProperties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            No Properties Selected
          </h1>
          <p className="text-gray-600 mb-6">
            Please select properties from the map first.
          </p>
          <Link href="/">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Go Back to Map
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/">
              <button className="text-blue-600 hover:text-blue-700 flex items-center">
                ← Back to Map
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 mt-2">
              Skip Tracing
            </h1>
            <p className="text-gray-600">
              {selectedProperties.length} properties •{" "}
              {checkedProperties.length} selected for skip tracing
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Provider:
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                disabled={isProcessing}
                className="border-2 border-blue-300 rounded-lg px-4 py-2 pr-12 bg-white text-gray-900 font-medium shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none min-w-[200px] appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 16px center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "16px",
                }}
              >
                {SKIP_TRACE_PROVIDERS.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} ({provider.costPerSearch})
                  </option>
                ))}
              </select>
            </div>

            {progress.total > 0 && (
              <div className="text-sm text-gray-600">
                Progress: {progress.completed}/{progress.total}(
                {Math.round((progress.completed / progress.total) * 100)}%)
              </div>
            )}

            <button
              onClick={handleSkipTraceAll}
              disabled={isProcessing || checkedProperties.length === 0}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing
                ? "Processing..."
                : checkedProperties.length === 0
                ? "No Properties Selected"
                : `Skip Trace ${checkedProperties.length} Properties`}
            </button>

            <button
              onClick={handleExportEnhanced}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Export Enhanced CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {progress.total > 0 && (
          <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Skip Tracing Progress</span>
              <span>
                {progress.completed}/{progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(progress.completed / progress.total) * 100}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>✅ Completed: {completedCount}</span>
              <span>❌ Failed: {failedCount}</span>
              <span>⏳ Remaining: {progress.total - progress.completed}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Additional Contacts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedProperties.map((property) => {
                  const result = skipTraceResults[property.id];
                  const isChecked = checkedForSkipTrace.has(property.id);
                  return (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSkipTraceCheck(property.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="text-lg"
                          title={result?.status || "waiting"}
                        >
                          {getStatusIcon(result?.status || "waiting")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {property.situsAddr || "No address"}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {property.propId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {property.ownerName || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${property.landValue?.toLocaleString() || "N/A"} •{" "}
                          {property.gisArea?.toFixed(2) || "N/A"} ac
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result?.phone ||
                          (result?.status === "processing" ? "..." : "-")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result?.email ||
                          (result?.status === "processing" ? "..." : "-")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {result?.additionalContacts?.join(", ") ||
                          (result?.status === "processing" ? "..." : "-")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {result?.status === "failed" && (
                            <button
                              onClick={() => handleRetryProperty(property.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Retry
                            </button>
                          )}
                          <button
                            onClick={() => removeProperty(property.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove property"
                          >
                            🗑️
                          </button>
                        </div>
                        {result?.error && (
                          <div
                            className="text-xs text-red-600 mt-1"
                            title={result.error}
                          >
                            Error
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
