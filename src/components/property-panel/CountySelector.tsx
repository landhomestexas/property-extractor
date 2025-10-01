import { getAllCounties } from "@/config/counties";

interface CountySelectorProps {
  county: string;
  setCounty: (county: string) => void;
}

export default function CountySelector({
  county,
  setCounty,
}: CountySelectorProps) {
  const counties = getAllCounties();

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        County
      </label>
      <select
        value={county}
        onChange={(e) => setCounty(e.target.value)}
        className="w-full border-2 border-blue-300 rounded-lg px-4 py-3 pr-12 bg-white text-gray-900 font-medium shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors cursor-pointer appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 16px center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "16px",
        }}
      >
        {counties.map((countyData) => (
          <option
            key={countyData.id}
            value={countyData.id}
            disabled={!countyData.available}
            className={
              countyData.available
                ? "font-medium text-gray-900"
                : "text-gray-400"
            }
          >
            {countyData.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
