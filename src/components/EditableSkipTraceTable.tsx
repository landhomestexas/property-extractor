"use client";

import React from "react";
import { SkipTraceProvider } from "@/config/skipTraceProviders";

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

// Create a simple input component that doesn't get recreated
function EditableInput({
  propertyId,
  field,
  value,
  required,
  onDataChange,
}: {
  propertyId: number;
  field: string;
  value: string;
  required?: boolean;
  onDataChange: (propertyId: number, field: string, value: string) => void;
}) {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onDataChange(propertyId, field, e.target.value)}
      className={`w-full px-2 py-1.5 text-sm border-2 rounded-md bg-white text-gray-900 font-medium ${
        required && !value
          ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200"
          : "border-blue-300 focus:border-blue-500 focus:ring-blue-200"
      } focus:outline-none focus:ring-1 transition-colors`}
      placeholder={required ? "Required" : "Optional"}
    />
  );
}

interface EditableSkipTraceTableProps {
  properties: Property[];
  provider: SkipTraceProvider;
  checkedProperties: Set<number>;
  onToggleCheck: (propertyId: number) => void;
  onRemoveProperty: (propertyId: number) => void;
  onDataChange: (propertyId: number, field: string, value: string) => void;
  editableData: Record<number, EditablePropertyData>;
}

function parseInitialData(property: Property): EditablePropertyData {
  const ownerName = property.ownerName || "";

  let firstName = "";
  let lastName = "";
  let middleName = "";

  // Property records format: "LAST FIRST MIDDLE" (e.g., "BISCOTTO MARK A")
  const nameParts = ownerName.split(" ").filter(Boolean);

  if (nameParts.length >= 2) {
    lastName = nameParts[0]; // First word is last name
    firstName = nameParts[1]; // Second word is first name
    middleName = nameParts.slice(2).join(" "); // Rest is middle name
  } else if (nameParts.length === 1) {
    lastName = nameParts[0]; // Only one name, treat as last name
    firstName = "";
    middleName = "";
  }

  const address = property.mailAddr || property.situsAddr || "";
  const addressParts = address
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const street = addressParts[0] || "";
  const city = addressParts[1] || "";
  const stateZip = addressParts[2] || "";
  const [state, zip] = stateZip.split(" ").filter(Boolean);

  return {
    propertyId: property.id,
    firstName,
    middleName,
    lastName,
    street,
    city,
    state: state || "",
    zip: zip || "",
  };
}

export default function EditableSkipTraceTable({
  properties,
  provider,
  checkedProperties,
  onToggleCheck,
  onRemoveProperty,
  onDataChange,
  editableData,
}: EditableSkipTraceTableProps) {
  if (provider.provider_id !== "enformion") {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Provider Not Available
        </h3>
        <p className="text-gray-600">
          {provider.name} integration is currently disabled pending
          documentation review.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Please select EnformionGo (TruePeopleSearch) for now.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                <input
                  type="checkbox"
                  checked={properties.every((p) => checkedProperties.has(p.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      properties.forEach((p) => onToggleCheck(p.id));
                    } else {
                      properties.forEach((p) => {
                        if (checkedProperties.has(p.id)) {
                          onToggleCheck(p.id);
                        }
                      });
                    }
                  }}
                  className="w-4 h-4 rounded"
                />
              </th>
              <th className="w-48 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Property
              </th>
              <th className="w-28 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                First <span className="text-red-500">*</span>
              </th>
              <th className="w-24 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Middle
              </th>
              <th className="w-28 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Last <span className="text-red-500">*</span>
              </th>
              <th className="w-36 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Street <span className="text-red-500">*</span>
              </th>
              <th className="w-24 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                City <span className="text-red-500">*</span>
              </th>
              <th className="w-16 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                State <span className="text-red-500">*</span>
              </th>
              <th className="w-20 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                ZIP <span className="text-red-500">*</span>
              </th>
              <th className="w-16 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                🗑️
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property) => {
              const isChecked = checkedProperties.has(property.id);
              const data = editableData[property.id];

              if (!data) return null;

              return (
                <tr
                  key={property.id}
                  className={`hover:bg-gray-50 ${
                    isChecked ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="w-12 px-2 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleCheck(property.id)}
                      className="w-4 h-4 rounded"
                    />
                  </td>
                  <td className="w-48 px-2 py-3">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {property.situsAddr || "No address"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {property.ownerName}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {property.propId}
                    </div>
                  </td>
                  <td className="w-28 px-2 py-3">
                    <EditableInput
                      propertyId={property.id}
                      field="firstName"
                      value={data.firstName}
                      required
                      onDataChange={onDataChange}
                    />
                  </td>
                  <td className="w-24 px-2 py-3">
                    <EditableInput
                      propertyId={property.id}
                      field="middleName"
                      value={data.middleName}
                      onDataChange={onDataChange}
                    />
                  </td>
                  <td className="w-28 px-2 py-3">
                    <EditableInput
                      propertyId={property.id}
                      field="lastName"
                      value={data.lastName}
                      required
                      onDataChange={onDataChange}
                    />
                  </td>
                  <td className="w-36 px-2 py-3">
                    <EditableInput
                      propertyId={property.id}
                      field="street"
                      value={data.street}
                      required
                      onDataChange={onDataChange}
                    />
                  </td>
                  <td className="w-24 px-2 py-3">
                    <EditableInput
                      propertyId={property.id}
                      field="city"
                      value={data.city}
                      required
                      onDataChange={onDataChange}
                    />
                  </td>
                  <td className="w-16 px-2 py-3">
                    <EditableInput
                      propertyId={property.id}
                      field="state"
                      value={data.state}
                      required
                      onDataChange={onDataChange}
                    />
                  </td>
                  <td className="w-20 px-2 py-3">
                    <EditableInput
                      propertyId={property.id}
                      field="zip"
                      value={data.zip}
                      required
                      onDataChange={onDataChange}
                    />
                  </td>
                  <td className="w-16 px-2 py-3 text-center">
                    <button
                      onClick={() => onRemoveProperty(property.id)}
                      className="text-red-500 hover:text-red-700 text-lg"
                      title="Remove property"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-600">
        <span className="text-red-500">*</span> Required fields must be filled
        before skip tracing
      </div>
    </div>
  );
}

export { parseInitialData };
