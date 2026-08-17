import { NavLink } from "react-router-dom";
import {
  Plus, LayoutDashboard, Zap, CheckSquare, Calendar, Users,
  ChevronLeft, ChevronRight, Sparkles,
} from "lucide-react";
import { useBoards } from "../../context/BoardsContext";
import { cn } from "../../lib/utils";

// Section eyebrow (hidden when collapsed)
const SectionLabel = ({ children, collapsed }) =>
  collapsed ? (
    <div className="mx-auto my-1.5 h-px w-6 bg-line" />
  ) : (
    <p className="px-3.5 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
      {children}
    </p>
  );

// A nav row that adapts to collapsed/expanded
const NavItem = ({ to, icon: Icon, label, collapsed, badge }) => (
  <NavLink
    to={to}
    title={collapsed ? label : undefined}
    className={({ isActive }) =>
      cn(
        "group relative flex h-9 items-center rounded-xl text-sm font-medium transition-colors duration-200",
        collapsed ? "mx-auto w-9 justify-center" : "gap-2.5 px-2.5",
        isActive
          ? "bg-brand-50 font-semibold text-brand-700"
          : "text-muted hover:bg-surface-2 hover:text-ink"
      )
    }
  >
    {({ isActive }) => (
      <>
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
        )}
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
        {!collapsed && badge != null && (
          <span className="rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-bold tabular text-bg">
            {badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

const Sidebar = ({ collapsed, onToggle, onCreateBoard }) => {
  const { boards, loading } = useBoards();

  return (
    <aside
      className={cn(
        "fixed inset-y-3 left-3 z-40 hidden flex-col overflow-hidden rounded-3xl border border-line bg-surface/90 shadow-soft backdrop-blur-xl transition-[width] duration-300 ease-[var(--ease-spring)] md:flex",
        collapsed ? "w-[72px]" : "w-[252px]"
      )}
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-2 px-3">
        <div className="brand-gradient grid h-9 w-9 shrink-0 place-items-center rounded-xl shadow-[var(--shadow-brand)]">
          <Zap className="h-5 w-5 fill-white text-white" />
        </div>
        {!collapsed && (
          <span className="flex-1 truncate font-display text-[17px] font-bold tracking-tight text-ink">
            Sprint Craft
          </span>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            title="Collapse sidebar"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex shrink-0 justify-center pb-1">
          <button
            onClick={onToggle}
            title="Expand sidebar"
            className="grid h-7 w-7 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Menu */}
      <div className="shrink-0">
        <SectionLabel collapsed={collapsed}>Menu</SectionLabel>
        <nav className="space-y-0.5 px-2.5">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
          <NavItem to="/my-tasks" icon={CheckSquare} label="My Tasks" collapsed={collapsed} />
          <NavItem to="/calendar" icon={Calendar} label="Calendar" collapsed={collapsed} />
          <NavItem to="/team" icon={Users} label="Team" collapsed={collapsed} />
        </nav>
      </div>

      {/* Boards heading stays put; list below fills leftover height */}
      <div className={cn("mt-1.5 flex h-7 shrink-0 items-center", collapsed ? "justify-center" : "justify-between px-3.5")}>
        {!collapsed && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">Boards</span>
        )}
        <button
          onClick={onCreateBoard}
          title="New board"
          className="rounded-md p-1 text-faint transition-colors hover:bg-surface-2 hover:text-brand-600"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-0.5 min-h-0 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-2.5 [scrollbar-width:thin]">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn("flex h-9 items-center gap-2.5", collapsed ? "justify-center" : "px-1")}>
              <div className="skeleton h-7 w-7 shrink-0 rounded-lg" />
              {!collapsed && <div className="skeleton h-3 flex-1 rounded" />}
            </div>
          ))
        ) : boards.length === 0 ? (
          !collapsed && <p className="px-3 py-2 text-xs text-faint">No boards yet</p>
        ) : (
          boards.map((b) => {
            const color = b.color || "#2f8159";
            return (
              <NavLink
                key={b.id}
                to={`/board/${b.id}`}
                title={b.title}
                className={({ isActive }) =>
                  cn(
                    "flex h-9 items-center rounded-xl text-sm transition-colors duration-200",
                    collapsed ? "mx-auto w-9 justify-center" : "gap-2.5 px-2",
                    isActive ? "bg-brand-50 font-medium text-brand-700" : "text-muted hover:bg-surface-2 hover:text-ink"
                  )
                }
              >
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg font-display text-[12px] font-bold"
                  style={{ backgroundColor: `${color}22`, color }}
                >
                  {b.title?.[0]?.toUpperCase() || "B"}
                </span>
                {!collapsed && <span className="flex-1 truncate">{b.title}</span>}
                {!collapsed && (
                  <span className="shrink-0 pr-1 text-[10px] font-medium tabular text-faint">{b.task_count}</span>
                )}
              </NavLink>
            );
          })
        )}
      </div>

      {!collapsed && (
        <div className="shrink-0 px-2.5 pb-3 pt-2">
          <button
            onClick={onCreateBoard}
            className="brand-gradient relative w-full overflow-hidden rounded-2xl p-3 text-left text-white shadow-[var(--shadow-brand)]"
          >
            <div className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-white/15 blur-xl" />
            <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-white/20 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <p className="relative mt-2 font-display text-sm font-semibold tracking-tight">Plan with AI</p>
            <p className="relative mt-0.5 text-[11px] leading-snug text-white/80">
              Turn a goal into a backlog in seconds.
            </p>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
