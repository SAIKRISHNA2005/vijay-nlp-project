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
    <div className="overflow-x-auto rounded-3xl border border-[var(--border)] bg-[color:var(--card)] shadow-[0_14px_35px_-22px_rgba(17,24,39,0.6)]">
      <table className="w-full text-sm">
        <thead className="bg-[#f7efe2] text-[#4b5563]">
          <tr>
            {headers.map((h, idx) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em]">
                <button
                  className="cursor-pointer text-left transition-colors hover:text-[#087e8b]"
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
        <tbody className="text-[#1f2937]">
          {sortedRows.map((row, idx) => (
            <tr key={idx} className="border-t border-[var(--border)] hover:bg-[#fff8ec]">
              {row.map((cell, cidx) => <td key={`${idx}-${cidx}`} className="px-4 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

