import React from "react";

export default function Table({ columns, data, actions }: any) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <table className="w-full text-left text-white">
        <thead className="bg-white/10">
          <tr>
            {columns.map((col: string, i: number) => (
              <th key={i} className="px-4 py-3 font-light text-gray-300">
                {col}
              </th>
            ))}
            {actions && <th className="px-4 py-3 font-light text-gray-300">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {data.map((row: any, idx: number) => (
            <tr key={idx} className="border-t border-white/10 hover:bg-white/5 transition">
              {columns.map((col: string, i: number) => (
                <td key={i} className="px-4 py-3 text-gray-300">
                  {row[col]}
                </td>
              ))}

              {actions && (
                <td className="px-4 py-3 flex gap-2">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
