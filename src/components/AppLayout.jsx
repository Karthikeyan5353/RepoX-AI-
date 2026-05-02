import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { GitBranch, LayoutDashboard, BookOpen, BarChart3, Settings, ChevronLeft, ChevronRight, Search, Bell, Sparkles } from "lucide-react";
import { useState } from "react";
const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/repositories", icon: GitBranch, label: "Repositories" },
    { to: "/learnings", icon: BookOpen, label: "Learnings" },
    { to: "/reports", icon: BarChart3, label: "Reports" },
    { to: "/settings", icon: Settings, label: "Settings" },
];
export function AppLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const currentSection = navItems.find((item) => location.pathname.startsWith(item.to))?.label ?? "Workspace";
    return (<div className="relative flex h-screen w-full overflow-hidden bg-transparent p-2 md:p-3">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[7%] h-56 w-56 rounded-full bg-emerald-500/8 blur-3xl"/>
        <div className="absolute right-[10%] top-[9%] h-64 w-64 rounded-full bg-cyan-500/8 blur-3xl"/>
        <div className="absolute bottom-[10%] right-[18%] h-56 w-56 rounded-full bg-orange-400/7 blur-3xl"/>
      </div>

      {/* Sidebar */}
      <aside className={`glass-panel-strong relative z-10 flex h-full flex-col rounded-[18px] transition-all duration-200 ${collapsed ? "w-20" : "w-[17rem]"}`}>
        {/* Logo */}
        <div className="flex h-[4.5rem] items-center gap-3 border-b border-sidebar-border/80 px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/6 bg-emerald-500/10">
            <GitBranch className="h-4 w-4 text-primary"/>
          </div>
          {!collapsed && (<span className="text-base font-black tracking-tight text-sidebar-foreground">
              RepoX
            </span>)}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-2 p-3">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (<Link key={item.to} to={item.to} className={`glass-interactive flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${active
                    ? "border border-white/6 bg-emerald-500/10 text-white"
                    : "border border-transparent text-sidebar-foreground/86 hover:bg-white/4 hover:text-white"}`}>
                <item.icon className="h-4 w-4 shrink-0"/>
                {!collapsed && <span>{item.label}</span>}
              </Link>);
        })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-sidebar-border/80 p-3">
          {!collapsed && (<div className="glass-chip mb-3 rounded-2xl px-4 py-3 text-xs text-sidebar-foreground/75">
              <p className="font-semibold uppercase tracking-[0.22em] text-white/55">Status</p>
              <p className="mt-1 text-sm text-white/90">AI reviewer online</p>
            </div>)}
          <button onClick={() => setCollapsed(!collapsed)} className="glass-interactive flex h-11 w-full items-center justify-center rounded-2xl border border-white/6 bg-white/[0.03] text-muted-foreground hover:text-foreground">
          {collapsed ? <ChevronRight className="h-4 w-4"/> : <ChevronLeft className="h-4 w-4"/>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col pl-2 md:pl-3">
        <header className="mb-2 flex h-[4.25rem] items-center justify-between rounded-[18px] px-3 md:px-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Control Center</p>
            <h1 className="mt-1 text-xl font-semibold text-white">{currentSection}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass-input hidden h-11 items-center gap-3 rounded-2xl px-4 text-sm text-white/70 md:flex">
              <Search className="h-4 w-4 text-white/45"/>
              <span>Search repositories, reports, or learnings</span>
            </div>
            <button className="glass-interactive glass-chip flex h-11 w-11 items-center justify-center rounded-2xl text-white/80 hover:text-white">
              <Bell className="h-4 w-4"/>
            </button>
            <div className="glass-chip flex items-center gap-3 rounded-2xl px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/70 to-cyan-500/55 text-white">
                <Sparkles className="h-4 w-4"/>
              </div>
              <div className="hidden text-left md:block">
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Mode</p>
                <p className="text-sm font-medium text-white/90">Premium Review</p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto rounded-[18px] scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>);
}
