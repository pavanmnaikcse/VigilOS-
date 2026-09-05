import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Briefcase, User, CreditCard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  type: string;
  title: string;
  risk: "HIGH" | "MEDIUM" | "LOW";
  violation: string;
  timestamp: string;
  unread: boolean;
}

export const initialNotifications: Notification[] = [
  {
    id: "CASE-2024-0519-005",
    type: "new_case",
    title: "New High Risk Case",
    risk: "HIGH",
    violation: "Structuring / Smurfing",
    timestamp: "2 min ago",
    unread: true,
  },
  {
    id: "CASE-2024-0519-006",
    type: "new_case",
    title: "New Medium Risk Case",
    risk: "MEDIUM",
    violation: "Unusual Transaction Pattern",
    timestamp: "8 min ago",
    unread: true,
  },
  {
    id: "CASE-2024-0519-007",
    type: "new_case",
    title: "New Low Risk Case",
    risk: "LOW",
    violation: "Velocity Rule",
    timestamp: "15 min ago",
    unread: true,
  },
];

const riskStyles = {
  HIGH: {
    color: "#FF3B30",
    border: "border-l-[#FF3B30]",
    bg: "bg-[#FF3B30]",
    text: "text-[#FF3B30]",
    icon: Briefcase,
    label: "High Risk",
    borderColor: "border-[#FF3B30]"
  },
  MEDIUM: {
    color: "#FFB020",
    border: "border-l-[#FFB020]",
    bg: "bg-[#FFB020]",
    text: "text-[#FFB020]",
    icon: User,
    label: "Medium Risk",
    borderColor: "border-[#FFB020]"
  },
  LOW: {
    color: "#00E5B0",
    border: "border-l-[#00E5B0]",
    bg: "bg-[#00E5B0]",
    text: "text-[#00E5B0]",
    icon: CreditCard,
    label: "Low Risk",
    borderColor: "border-[#00E5B0]"
  },
};

export function NotificationsPopup({
  isOpen,
  onClose,
  notifications,
  setNotifications,
}: {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  setNotifications: (n: Notification[]) => void;
}) {
  const navigate = useNavigate();
  const popupRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (id: string) => {
    navigate(`/case/${id}`);
    onClose();
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-[calc(100%+12px)] z-50 w-[420px] origin-top-right rounded-xl animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        background: "rgba(5, 17, 30, 0.95)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(0, 229, 255, 0.25)",
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.8), 0 0 20px -5px rgba(0,229,255,0.15)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-[13px] font-bold tracking-widest text-white uppercase">Notifications</h3>
        <button 
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-1.5 text-[11.5px] text-cyan hover:text-cyan/80 transition-colors"
        >
          Mark all as read
          <CheckCircle2 size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-3 pb-3">
        <div className="flex w-full rounded-lg bg-black/40 p-1 border border-white/5">
          {["All", "New Cases", "System Alerts"].map((tab) => {
            const isActive = activeTab === tab;
            const count = tab === "All" || tab === "New Cases" ? unreadCount : 0;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-[11px] font-medium transition-all",
                  isActive
                    ? "bg-cyan/15 text-cyan border border-cyan/30 shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                )}
              >
                {tab}
                <span
                  className={cn(
                    "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold",
                    isActive ? "bg-cyan text-[#111]" : "bg-white/10 text-white/60"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2 px-3 pb-3 max-h-[340px] overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {notifications.map((notif) => {
          const style = riskStyles[notif.risk];
          const Icon = style.icon;

          return (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif.id)}
              className={cn(
                "group relative flex cursor-pointer gap-3 rounded-lg border border-white/10 bg-white/5 p-3 pr-2 transition-all hover:bg-white/10",
                notif.unread ? "border-l-2" : "border-l-2 border-l-transparent",
                notif.unread && style.border
              )}
            >
              {/* Subtle hover glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 20px -10px ${style.color}`,
                }}
              />

              {/* Icon */}
              <div className="mt-0.5 shrink-0 relative">
                <div 
                  className={cn("grid h-10 w-10 place-items-center rounded-lg border bg-black/40", style.text, style.borderColor)}
                  style={{ boxShadow: `0 0 10px -2px ${style.color}40` }}
                >
                  <Icon size={18} />
                </div>
                {/* Unread dot overlay */}
                {notif.unread && (
                  <div 
                    className={cn("absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#05111e]", style.bg)} 
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-center min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="truncate text-[13px] font-bold text-white">{notif.title}</h4>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{notif.timestamp}</span>
                </div>
                
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground font-mono">
                  {notif.id}
                </div>
                
                <div className="mt-1 flex items-center justify-between">
                  <div className="truncate text-[11px] text-foreground/80">
                    Violation: <span className={style.text}>{notif.violation}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span 
                      className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", style.text, style.borderColor)}
                      style={{ background: `${style.color}15` }}
                    >
                      {style.label}
                    </span>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-cyan/10 p-2.5 text-center">
        <button className="text-[11px] font-medium text-cyan hover:text-cyan/80 transition-colors flex items-center justify-center gap-1 w-full">
          View all notifications <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
