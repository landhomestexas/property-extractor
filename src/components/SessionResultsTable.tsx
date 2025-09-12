"use client";

import { Property, ContactData } from "@/types/session";

interface SessionResultsTableProps {
  properties: Property[];
  results: Record<number, ContactData>;
}

export default function SessionResultsTable({
  properties,
  results,
}: SessionResultsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-48 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Property
            </th>
            <th className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Mobiles
            </th>
            <th className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Landlines
            </th>
            <th className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Emails
            </th>
            <th className="w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {properties.map((property) => {
            const result = results[property.id];

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
                <td className="w-40 px-3 py-2 text-sm">
                  <div className="space-y-1">
                    {result?.mobiles.map((phone, i) => (
                      <div key={i} className="text-green-600">
                        📱 {phone}
                      </div>
                    )) || <div className="text-gray-400">No mobile</div>}
                  </div>
                </td>
                <td className="w-40 px-3 py-2 text-sm">
                  <div className="space-y-1">
                    {result?.landlines.map((phone, i) => (
                      <div key={i} className="text-blue-600">
                        📞 {phone}
                      </div>
                    )) || <div className="text-gray-400">No landline</div>}
                  </div>
                </td>
                <td className="w-40 px-3 py-2 text-sm">
                  <div className="space-y-1">
                    {result?.emails.map((email, i) => (
                      <div key={i} className="text-purple-600">
                        ✉️ {email}
                      </div>
                    )) || <div className="text-gray-400">No email</div>}
                  </div>
                </td>
                <td className="w-16 px-3 py-2 text-center">
                  {result ? (
                    <span className="text-green-500 text-lg">✅</span>
                  ) : (
                    <span className="text-red-500 text-lg">❌</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
