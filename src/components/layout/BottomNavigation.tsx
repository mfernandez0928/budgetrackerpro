import { EllipsisHorizontalIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCallback, useRef, useState } from "react";
import { useDialogFocus } from "../../hooks/useDialogFocus";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getActiveNavKey } from "../../lib/ui";
import { MoreSheet } from "./MoreSheet";
import { primaryNav, quickActions } from "./navigation";

const slotClass = (active: boolean) =>
  `flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition ${
    active ? "text-brand" : "text-muted hover:text-ink"
  }`;

export function BottomNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeKey = getActiveNavKey(pathname);
  const [addOpen, setAddOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const addRef = useRef<HTMLDivElement>(null);
  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closeMore = useCallback(() => setMoreOpen(false), []);
  useDialogFocus(addOpen, addRef, closeAdd);

  const [home, wallet, plan] = primaryNav;
  const renderLink = (item: typeof home) => (
    <NavLink to={item.to} className={() => slotClass(activeKey === item.key)}>
      <item.icon className="h-6 w-6" />
      {item.label}
    </NavLink>
  );

  return (
    <>
      {addOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAddOpen(false)} aria-hidden="true" />
          <div
            ref={addRef}
            role="dialog"
            aria-modal="true"
            aria-label="Quick add"
            className="absolute inset-x-3 bottom-[calc(96px+env(safe-area-inset-bottom))] rounded-3xl border border-line bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Quick add</p>
                <p className="mt-1 text-base font-bold text-ink">Pick the next money move</p>
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-raised text-muted"
                aria-label="Close quick actions"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {quickActions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setAddOpen(false);
                    navigate(item.action);
                  }}
                  className="w-full rounded-2xl bg-raised px-4 py-3 text-left transition hover:bg-brand/10"
                >
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  <p className="mt-0.5 text-xs text-muted">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <MoreSheet open={moreOpen} onClose={closeMore} />

      <div className="pb-safe fixed inset-x-0 bottom-0 z-50 px-3 md:hidden">
        <nav
          aria-label="Main"
          className="mx-auto mb-3 grid max-w-xl grid-cols-5 items-center rounded-[26px] border border-line bg-surface/95 p-2 backdrop-blur"
        >
          {renderLink(home)}
          {renderLink(wallet)}
          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              setAddOpen((value) => !value);
            }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-on-brand shadow-lg transition hover:brightness-110"
            aria-label="Open quick actions"
            aria-expanded={addOpen}
          >
            <PlusIcon className="h-7 w-7" />
          </button>
          {renderLink(plan)}
          <button
            type="button"
            onClick={() => {
              setAddOpen(false);
              setMoreOpen((value) => !value);
            }}
            className={slotClass(activeKey === "more" || moreOpen)}
            aria-expanded={moreOpen}
          >
            <EllipsisHorizontalIcon className="h-6 w-6" />
            More
          </button>
        </nav>
      </div>
    </>
  );
}
