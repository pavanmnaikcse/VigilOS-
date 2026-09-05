import {
  LayoutDashboard,
  Inbox,
  Search,
  ShieldQuestion,
  FileText,
  Users,
  ScrollText,
  Settings,
  ShieldCheck,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusDot } from "./primitives";
import { useNavigate, useLocation } from "react-router-dom";

const groups = [
  {
    label: "Main",
    items: [
      { id: "/", label: "Dashboard", icon: LayoutDashboard },
      { id: "/queue", label: "Case Queue", icon: Inbox },
    ],
  },
  {
    label: "Tools",
    items: [
      { id: "/investigations", label: "Investigations", icon: ShieldQuestion },
      { id: "/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [
      { id: "/users", label: "Users", icon: Users },
      { id: "/audit", label: "Audit Logs", icon: ScrollText },
      { id: "/transaction-data", label: "Transaction Data", icon: Database },
      ],
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname;

  return (
    <aside className="hidden w-[218px] shrink-0 flex-col overflow-hidden border-r border-cyan/12 bg-[rgba(3,14,24,0.82)] backdrop-blur-xl md:flex">
        <div className="flex items-center gap-2.5 px-2 py-4">
          <button className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-transform duration-200 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group relative animate-rainbow cursor-pointer border-0 bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] bg-[length:200%] text-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] before:absolute before:bottom-[-20%] before:left-1/2 before:z-[0] before:h-[20%] before:w-[60%] before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] before:[filter:blur(calc(0.8*1rem))] hover:scale-105 active:scale-95 h-10 px-4 py-2 inline-flex w-[90%] mx-auto">
            <div className="flex items-center gap-2 w-full justify-center">
              <ShieldCheck size={18} className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
              <span className="text-white font-bold tracking-[0.25em] text-[15px]">VIGILOS</span>
            </div>
          </button>
        </div>

      <nav className="min-h-0 flex-1 overflow-hidden px-2.5">
        {groups.map((group) => (
          <div key={group.label} className="mb-3">
            <div className="px-2 pb-1.5 text-[9px] font-semibold tracking-[0.18em] text-muted-foreground/70 uppercase">
              {group.label}
            </div>
            <ul className="space-y-[3px]">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => navigate(item.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] transition-colors",
                        isActive
                          ? "border border-cyan/45 bg-cyan/10 text-white"
                          : "border border-transparent text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                      )}
                      style={
                        isActive
                          ? { boxShadow: "0 0 20px -8px rgba(0,229,255,0.85), inset 0 0 18px -12px rgba(0,229,255,0.9)" }
                          : undefined
                      }
                    >
                      <Icon size={15} className={isActive ? "text-cyan" : ""} />
                      <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                      {"badge" in item && item.badge ? (
                        <span className="shrink-0 rounded-md border border-cyan/30 bg-cyan/10 px-1.5 py-[1px] text-[10px] font-semibold text-cyan">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="glass m-2.5 rounded-lg px-3 py-2.5">
        <div className="panel-title">System Status</div>
        <div className="mt-2 flex items-center gap-2">
          <StatusDot />
          <span className="text-[11.5px] font-medium text-teal">All Systems Operational</span>
        </div>
        <div className="mt-2 border-t border-cyan/10 pt-1.5 text-[10px] text-muted-foreground/70">
          v1.0.0
        </div>
      </div>
    </aside>
  );
}
