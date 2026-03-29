import { motion } from "framer-motion";
import { BarChart3, Clock4, FileUp, FileText, LayoutDashboard, ListChecks, SearchCheck } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload RFP", icon: FileUp },
  { to: "/processing", label: "Processing", icon: SearchCheck },
  { to: "/results", label: "Results", icon: BarChart3 },
  { to: "/proposal", label: "Proposal", icon: FileText },
  { to: "/history", label: "History", icon: Clock4 },
];

export function AppShell() {
  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-4 p-4 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-6 flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-cyan-300" />
          <p className="font-semibold">RFP Automation</p>
        </div>
        <nav className="grid gap-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn("rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-800", isActive && "bg-slate-800 text-cyan-300")
              }
            >
              <item.icon className="mr-2 inline h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <motion.main initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <Outlet />
      </motion.main>
    </div>
  );
}

