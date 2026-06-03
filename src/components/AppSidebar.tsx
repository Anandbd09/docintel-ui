import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Brain, Home, Upload, FileText, Sparkles, ChevronLeft, ChevronRight, Search, History, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useUserId, useUserName } from "@/lib/userStore";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/search", label: "Cross Search", icon: Search },
  { to: "/audit", label: "Audit Log", icon: History },
];

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AppSidebar({ mobileOpen = false, onMobileClose = () => {} }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [userId, setUserId] = useUserId();
  const [userName, setUserName] = useUserName();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUserId("");
    setUserName("");
    onMobileClose();
    navigate({ to: "/login" });
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 w-60 flex flex-col transition-all duration-300 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 lg:shrink-0 ${collapsed ? "lg:w-[72px]" : "lg:w-60"}`}
        style={{ background: "oklch(0.15 0.04 260)", borderRight: "1px solid oklch(0.28 0.04 260 / 0.5)" }}
      >
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? "justify-center px-0" : "gap-3 px-4"} h-16 border-b border-border/30`}>
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-md opacity-50" />
          <div className="relative bg-gradient-primary p-2 rounded-xl shadow-glow">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
        {!collapsed && (
          <div>
            <div className="font-display font-bold text-sm leading-tight">
              DocIntel <span className="text-primary">AI</span>
            </div>
            <div className="text-[9px] text-muted-foreground tracking-widest uppercase mt-0.5">Intelligence</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-5 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              className={`flex items-center ${collapsed ? "justify-center px-0" : "gap-3 px-3"} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {active && !collapsed && <Sparkles className="h-3 w-3 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border/30 p-2.5 space-y-1">
        {/* User ID */}
        {!collapsed && (userName || userId) && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1" style={{ background: "oklch(0.20 0.04 260)" }}>
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Name</div>
              <div className="text-[11px] text-foreground/80 truncate">{userName || userId}</div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed ? "justify-center px-0" : "gap-2 px-3"} py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors duration-200`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`w-full flex items-center ${collapsed ? "justify-center px-0" : "gap-2 px-3"} py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors duration-200`}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
    </>
  );
}
