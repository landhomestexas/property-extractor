"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePropertyStore } from "@/stores/propertyStore";
import { useSessionStore } from "@/stores/sessionStore";
import {
  SKIP_TRACE_PROVIDERS,
  getProviderById,
  getProviderByEndpoint,
} from "@/config/skipTraceProviders";
import EditableSkipTraceTable, {
  parseInitialData,
} from "@/components/EditableSkipTraceTable";

interface Property {
  id: number;
  propId: string;
  ownerName: string | null;
  situsAddr: string | null;
  mailAddr: string | null;
  landValue: number | null;
  mktValue: number | null;
  gisArea: number | null;
  county: string;
}
interface EditablePropertyData {
  propertyId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}
import SessionCard from "@/components/SessionCard";
import { processEnformionResponse } from "@/utils/contactDataProcessor";
import Link from "next/link";
import { NoPropertiesSelected } from "@/components/EmptyStates";

const pluralize = (count: number, singular: string, plural?: string) => {
  const pluralForm = plural || `${singular}s`;
  return `${count} ${count === 1 ? singular : pluralForm}`;
};

export default function SkipTracingPage() {
  const {
    selectedProperties,
    checkedForSkipTrace,
    toggleSkipTraceCheck,
    removeProperty,
    cachePropertyDetails,
    county,
    setCounty,
  } = usePropertyStore();

  const {
    sessions,
    viewMode,
    createSession,
    addResultsToSession,
    deleteSession,
    exportSession,
  } = useSessionStore();

  const [selectedProvider, setSelectedProvider] = useState(
    "enformion|/Contact/Enrich"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [editableData, setEditableData] = useState<
    Record<number, EditablePropertyData>
  >({});
  const [propertiesFromStorage, setPropertiesFromStorage] = useState<
    Property[]
  >([]);
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(true);

  useEffect(() => {
    const loadPropertiesFromStorage = async () => {
      try {
        const storedPropertyIds = localStorage.getItem("skipTracePropertyIds");
        const storedCounty = localStorage.getItem("skipTraceCounty");

        if (storedPropertyIds && storedCounty) {
          const propertyIds: number[] = JSON.parse(storedPropertyIds);

          if (county !== storedCounty) {
            setCounty(storedCounty);
          }

          const response = await fetch(
            `/api/properties/details?ids=${propertyIds.join(",")}`
          );
          const propertyDetails = await response.json();

          const properties: Property[] = propertyIds
            .map((id) => ({
              ...propertyDetails[id],
              county: storedCounty,
            }))
            .filter(Boolean);

          setPropertiesFromStorage(properties);
          cachePropertyDetails(propertyDetails);

          properties.forEach((property) => {
            toggleSkipTraceCheck(property.id);
          });

          localStorage.removeItem("skipTracePropertyIds");
          localStorage.removeItem("skipTraceCounty");
        }
      } catch (error) {
        console.error("Failed to load properties from storage:", error);
      } finally {
        setIsLoadingFromStorage(false);
      }
    };

    loadPropertiesFromStorage();
  }, [county, setCounty, cachePropertyDetails]);

  const effectiveProperties =
    selectedProperties.length > 0 ? selectedProperties : propertiesFromStorage;

  const checkedProperties = useMemo(
    () => effectiveProperties.filter((p) => checkedForSkipTrace.has(p.id)),
    [effectiveProperties, checkedForSkipTrace]
  );

  useEffect(() => {
    const initialEditableData: Record<number, EditablePropertyData> = {};

    effectiveProperties.forEach((property) => {
      initialEditableData[property.id] = parseInitialData(property);
    });

    setEditableData(initialEditableData);
  }, [effectiveProperties]);

  const handleDataChange = useCallback(
    (propertyId: number, field: string, value: string) => {
      setEditableData((prev) => ({
        ...prev,
        [propertyId]: {
          ...prev[propertyId],
          [field]: value,
        },
      }));
    },
    []
  );

  const handleSkipTraceAll = async () => {
    if (checkedProperties.length === 0) return;

    setIsProcessing(true);
    const [providerId, endpoint] = selectedProvider.split("|");
    const provider = getProviderByEndpoint(providerId, endpoint);

    if (!provider) {
      console.error("Provider not found");
      setIsProcessing(false);
      return;
    }

    if (provider.provider_id === "batchdata") {
      alert(
        "BatchData is currently disabled pending documentation review. Please use Contact Enrichment or Address ID."
      );
      setIsProcessing(false);
      return;
    }

    try {
      const sessionEditableData: Record<number, EditablePropertyData> = {};
      checkedProperties.forEach((property) => {
        sessionEditableData[property.id] = editableData[property.id];
      });

      setProgress({ completed: 0, total: checkedProperties.length });
      let sessionId: string | null = null;

      for (let i = 0; i < checkedProperties.length; i++) {
        const property = checkedProperties[i];
        const data = editableData[property.id];

        try {
          const apiRoute =
            provider.endpoint === "/Address/Id"
              ? "/api/skip-trace/enformion-address"
              : "/api/skip-trace/enformion";

          const response = await fetch(apiRoute, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              properties: [
                {
                  propertyId: property.id,
                  firstName: data.firstName,
                  middleName: data.middleName,
                  lastName: data.lastName,
                  street: data.street,
                  city: data.city,
                  state: data.state,
                  zip: data.zip,
                },
              ],
              endpoint: provider.endpoint,
            }),
          });

          const { results } = await response.json();
          const result = results[0];
          if (!sessionId) {
            sessionId = createSession(
              checkedProperties,
              selectedProvider,
              sessionEditableData
            );
          }

          if (result && result.status === "completed") {
            const contactData = processEnformionResponse(result.data);
            contactData.endpointUsed = result.endpointUsed || provider.name;
            if (result.foundPersonName) {
              contactData.foundPersonName = result.foundPersonName;
            }
            addResultsToSession(sessionId, property.id, contactData);
          } else if (result) {
            addResultsToSession(sessionId, property.id, {
              mobiles: [],
              landlines: [],
              emails: [],
              endpointUsed: result.endpointUsed || provider.name,
              foundPersonName: result.foundPersonName,
            });
          }
        } catch (error) {
          console.error("Skip trace error:", error);
        }
        setProgress((prev) => ({ ...prev, completed: i + 1 }));
      }
    } catch (error) {
      console.error("Skip trace process failed:", error);
    }

    setIsProcessing(false);
  };

  const handleExportAllSessions = () => {
    if (sessions.length === 0) return;

    const allSessionData = sessions.flatMap((session) =>
      session.properties.map((property) => {
        const result = session.results[property.id];
        const input = session.inputData[property.id];

        return {
          County:
            property.county.charAt(0).toUpperCase() + property.county.slice(1),
          Provider: session.provider,
          "Property ID": property.propId,
          "Owner Name": property.ownerName || "",
          "Property Address": property.situsAddr || "",
          "Found Person Name": result?.foundPersonName || "",
          "Input First Name": input?.firstName || "",
          "Input Last Name": input?.lastName || "",
          "All Mobile Phones": result?.mobiles.join("\n") || "",
          "All Landline Phones": result?.landlines.join("\n") || "",
          "All Emails": result?.emails.join("\n") || "",
          "Contact Found":
            result &&
            ((result.mobiles && result.mobiles.length > 0) ||
              (result.landlines && result.landlines.length > 0) ||
              (result.emails && result.emails.length > 0))
              ? "Yes"
              : "No",
        };
      })
    );

    const csvContent = [
      Object.keys(allSessionData[0]).join(","),
      ...allSessionData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(",")
      ),
    ].join("\n");

    const countyName = sessions[0]?.properties[0]?.county
      ? sessions[0].properties[0].county.charAt(0).toUpperCase() +
        sessions[0].properties[0].county.slice(1)
      : "Unknown";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${countyName}-County-All-Skip-Trace-Sessions-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoadingFromStorage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (effectiveProperties.length === 0) {
    return <NoPropertiesSelected />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 flex justify-between items-center">
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
              {pluralize(effectiveProperties.length, "property", "properties")}{" "}
              • {checkedProperties.length} selected for skip tracing
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
                className="border-2 border-blue-300 rounded-lg px-4 py-2 pr-12 bg-white text-gray-900 font-medium shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none min-w-[320px] appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 16px center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "16px",
                }}
              >
                {SKIP_TRACE_PROVIDERS.map((provider) => (
                  <option
                    key={`${provider.provider_id}|${provider.endpoint}`}
                    value={`${provider.provider_id}|${provider.endpoint}`}
                  >
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
                : `Skip Trace ${pluralize(
                    checkedProperties.length,
                    "Property",
                    "Properties"
                  )}`}
            </button>

            <button
              onClick={handleExportAllSessions}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Export All Sessions
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {progress.total > 0 && (
          <div className="mb-6 bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Skip Tracing in Progress
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isProcessing
                    ? `Processing ${pluralize(
                        progress.total,
                        "property",
                        "properties"
                      )} and collecting contact information...`
                    : "Skip trace completed. Results will appear below once all data is processed."}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((progress.completed / progress.total) * 100)}%
                </div>
                <div className="text-sm text-gray-500">
                  {progress.completed}/{progress.total}{" "}
                  {progress.total === 1 ? "property" : "properties"}
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${(progress.completed / progress.total) * 100}%`,
                }}
              ></div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">
                ✅ Completed: {progress.completed}
              </span>
              <span className="text-gray-500">
                ⏳ Remaining: {progress.total - progress.completed}
              </span>
            </div>

            {isProcessing && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center text-blue-800">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm font-medium">
                    Processing... Results table will appear automatically when
                    ready.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === "input" && (
          <div>
            {/* Provider Info Section */}
            <div className="mb-6 space-y-4">
              {/* Provider description */}
              {selectedProvider &&
                (() => {
                  const [providerId, endpoint] = selectedProvider.split("|");
                  const provider = getProviderByEndpoint(providerId, endpoint);
                  return provider ? (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                      <div className="flex items-start space-x-2">
                        <div className="text-blue-600 text-sm">📋</div>
                        <div className="text-sm text-blue-800">
                          <strong>{provider.name}:</strong>{" "}
                          {provider.description}
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

              {/* Warning for Address ID */}
              {selectedProvider.includes("/Address/Id") && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                  <div className="flex items-start space-x-2">
                    <div className="text-amber-600 text-sm">⚠️</div>
                    <div className="text-sm text-amber-800">
                      <strong>Important:</strong> When using Address ID, if a
                      person is found at the address, their name may override
                      the original owner name in your results table. This
                      provides more accurate contact information by
                      automatically chaining to Contact Enrichment.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <EditableSkipTraceTable
              properties={effectiveProperties}
              provider={(() => {
                const [providerId, endpoint] = selectedProvider.split("|");
                return getProviderByEndpoint(providerId, endpoint)!;
              })()}
              checkedProperties={checkedForSkipTrace}
              onToggleCheck={toggleSkipTraceCheck}
              onRemoveProperty={removeProperty}
              onDataChange={handleDataChange}
              editableData={editableData}
            />
          </div>
        )}

        {sessions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Previous Sessions
            </h2>
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onExport={exportSession}
                onDelete={deleteSession}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
