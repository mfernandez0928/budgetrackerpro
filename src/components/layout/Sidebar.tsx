import {
  ArrowRightOnRectangleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { APP_BRANDING } from "../../config/app";
import { useSignOut } from "../../hooks/useSignOut";
import { readSidebarCollapsed, writeSidebarCollapsed } from "../../lib/ui";
import { moreNav, primaryNav, quickActions } from "./navigation";

function navClass(collapsed: boolean) {
  return ({ isActive }: { isActive: boolean }) =>
    `flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
      collapsed ? "justify-center" : ""
    } ${
      isActive
        ? "bg-brand/15 text-ink shadow-[inset_3px_0_0_rgb(var(--brand))]"
        : "text-muted hover:bg-raised hover:text-ink"
    }`;
}

export function Sidebar() {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const [collapsed, setCollapsed] = useState(() => readSidebarCollapsed());
  const [addOpen, setAddOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!addOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!addRef.current?.contains(event.target as Node)) setAddOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAddOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [addOpen]);

  function toggleCollapsed() {
    setCollapsed((value) => {
      writeSidebarCollapsed(!value);
      return !value;
    });
  }

  const groupLabel = (label: string) =>
    collapsed ? (
      <div className="mx-3 my-3 border-t border-line" />
    ) : (
      <p className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
    );

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-surface px-3 py-5 transition-[width] md:flex ${
        collapsed ? "w-[72px]" : "w-[232px]"
      }`}
    >
      <div className={`flex items-center gap-3 px-1 pb-5 ${collapsed ? "justify-center" : ""}`}>
        <img src="/icon-192.svg" alt="" className="h-9 w-9 rounded-xl" />
        {collapsed ? null : (
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-ink">{APP_BRANDING.shortName}</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Personal</p>
          </div>
        )}
      </div>

      <div ref={addRef} className="relative">
        <button
          type="button"
          onClick={() => setAddOpen((value) => !value)}
          aria-expanded={addOpen}
          aria-haspopup="menu"
          title="Add"
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-brand text-sm font-bold text-on-brand transition hover:brightness-110"
        >
          <PlusIcon className="h-5 w-5" />
          {collapsed ? null : "Add"}
        </button>
        {addOpen ? (
          <div
            role="menu"
            className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-line bg-surface p-2 shadow-2xl"
          >
            {quickActions.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setAddOpen(false);
                  navigate(item.action);
                }}
                className="w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-raised"
              >
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <p className="text-xs text-muted">{item.description}</p>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1" aria-label="Main">
        {groupLabel("Main")}
        {primaryNav.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClass(collapsed)} title={item.label}>
            <item.icon className="h-5 w-5 shrink-0" />
            {collapsed ? null : item.label}
          </NavLink>
        ))}
        {groupLabel("More")}
        {moreNav.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClass(collapsed)} title={item.label}>
            <item.icon className="h-5 w-5 shrink-0" />
            {collapsed ? null : item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-line pt-3">
        <button
          type="button"
          onClick={signOut}
          title="Sign out"
          className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition hover:bg-neg/10 hover:text-neg ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
          {collapsed ? null : "Sign out"}
        </button>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition hover:bg-raised hover:text-ink ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? (
            <ChevronDoubleRightIcon className="h-5 w-5" />
          ) : (
            <>
              <ChevronDoubleLeftIcon className="h-5 w-5" />
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
