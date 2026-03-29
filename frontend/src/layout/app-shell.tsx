import { motion } from "framer-motion";
import { BarChart3, Clock4, FileUp, FileText, LayoutDashboard, ListChecks, SearchCheck, Sparkles } from "lucide-react";
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
    <div className="relative grid min-h-screen w-full gap-5 p-3 sm:p-5 lg:grid-cols-[260px_1fr] lg:p-7">
      <div className="pointer-events-none absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 rounded-full bg-[#f4a259]/20 blur-3xl" />
      <aside className="relative overflow-hidden rounded-3xl border border-[#e2d5c3] bg-[#fffcf6]/95 p-5 shadow-[0_20px_45px_-30px_rgba(17,24,39,0.7)]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#f4a259]/30 blur-xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-[#1f766f]/20 blur-xl" />
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-[#e6f6f3] p-2.5 text-[var(--primary)]">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">Workspace</p>
            <p className="font-semibold text-[#1f2937]">RFP Automation</p>
          </div>
        </div>
        <nav className="grid gap-2.5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center rounded-2xl px-3 py-2.5 text-sm font-medium text-[#475569] transition duration-200 hover:translate-x-1 hover:bg-[#efe2d0] hover:text-[#1f2937]",
                  isActive && "bg-[#1f766f] text-[#f3fffb] shadow-[0_8px_20px_-14px_rgba(8,126,139,0.8)]",
                )
              }
            >
              <item.icon className="mr-2 inline h-4 w-4" />
              {item.label}
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-current opacity-0 transition group-hover:opacity-70" />
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 rounded-2xl border border-[#e9dcc8] bg-[#fff8eb] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[#9ca3af]">Pipeline</p>
          <p className="mt-1 text-sm text-[#4b5563]">Upload, analyze, and generate proposals faster with a guided workflow.</p>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f7edde] px-2.5 py-2 text-xs text-[#6b7280]">
            <Sparkles className="h-3.5 w-3.5 text-[#f4a259]" />
            Smart flow tuned for quick procurement decisions
          </div>
        </div>
      </aside>
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-[#e5d9c8] bg-[#fffdf9]/95 p-4 shadow-[0_25px_55px_-36px_rgba(17,24,39,0.75)] sm:p-6"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-[#f7e4c9]/60 via-transparent to-[#d7f2ed]/60" />
        <Outlet />
      </motion.main>
    </div>
  );
}

