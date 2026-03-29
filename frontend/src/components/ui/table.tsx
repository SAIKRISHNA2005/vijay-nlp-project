import type { ReactNode } from "react";
import { useMemo, useState } from "react";

export function DataTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  const [sortIndex, setSortIndex] = useState(0);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = String(a[sortIndex] ?? "");
      const bv = String(b[sortIndex] ?? "");
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [rows, sortDir, sortIndex]);

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/90 text-slate-300">
          <tr>
            {headers.map((h, idx) => (
              <th key={h} className="px-3 py-2 text-left">
                <button
                  className="cursor-pointer text-left"
                  onClick={() => {
                    if (sortIndex === idx) setSortDir(sortDir === "asc" ? "desc" : "asc");
                    else {
                      setSortIndex(idx);
                      setSortDir("asc");
                    }
                  }}
                >
                  {h}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, idx) => (
            <tr key={idx} className="border-t border-slate-800">
              {row.map((cell, cidx) => <td key={`${idx}-${cidx}`} className="px-3 py-2">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

