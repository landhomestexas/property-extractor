"use client";

import { Property, EditablePropertyData } from "@/types/session";

interface SessionInputTableProps {
  properties: Property[];
  inputData: Record<number, EditablePropertyData>;
}

export default function SessionInputTable({
  properties,
  inputData,
}: SessionInputTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-48 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Property
            </th>
            <th className="w-28 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              First
            </th>
            <th className="w-24 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Middle
            </th>
            <th className="w-28 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Last
            </th>
            <th className="w-36 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Street
            </th>
            <th className="w-24 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              City
            </th>
            <th className="w-16 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              State
            </th>
            <th className="w-20 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              ZIP
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {properties.map((property) => {
            const input = inputData[property.id];
            if (!input) return null;

            return (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="w-48 px-3 py-2">
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
                <td className="w-28 px-3 py-2 text-sm text-gray-900">
                  {input.firstName}
                </td>
                <td className="w-24 px-3 py-2 text-sm text-gray-900">
                  {input.middleName}
                </td>
                <td className="w-28 px-3 py-2 text-sm text-gray-900">
                  {input.lastName}
                </td>
                <td className="w-36 px-3 py-2 text-sm text-gray-900">
                  {input.street}
                </td>
                <td className="w-24 px-3 py-2 text-sm text-gray-900">
                  {input.city}
                </td>
                <td className="w-16 px-3 py-2 text-sm text-gray-900">
                  {input.state}
                </td>
                <td className="w-20 px-3 py-2 text-sm text-gray-900">
                  {input.zip}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
