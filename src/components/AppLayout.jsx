import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { GitBranch, LayoutDashboard, BookOpen, BarChart3, Settings, ChevronLeft, ChevronRight, } from "lucide-react";
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
    return (<div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex flex-col border-r border-border bg-sidebar transition-all duration-200 ${collapsed ? "w-16" : "w-56"}`}>
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_25%,transparent)]">
            <GitBranch className="h-4 w-4 text-primary"/>
          </div>
          {!collapsed && (<span className="text-base font-black tracking-tight text-sidebar-foreground">
              RepoX
            </span>)}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (<Link key={item.to} to={item.to} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${active
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"}`}>
                <item.icon className="h-4 w-4 shrink-0"/>
                {!collapsed && <span>{item.label}</span>}
              </Link>);
        })}
        </nav>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} className="flex h-10 items-center justify-center border-t border-sidebar-border text-muted-foreground hover:text-foreground">
          {collapsed ? <ChevronRight className="h-4 w-4"/> : <ChevronLeft className="h-4 w-4"/>}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto scrollbar-thin">
        <Outlet />
      </main>
    </div>);
}
