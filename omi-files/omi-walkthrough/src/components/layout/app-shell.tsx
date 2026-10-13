"use client";

import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Cpu } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { NAV, GATES } from "@/lib/xor/gates";
import { hydrateProgress, useProgress } from "@/lib/xor/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const completed = useProgress((s) => s.completedGates);
  const protocols = useProgress((s) => s.completedProtocols);
  const total = GATES.length + 4;
  const done = completed.length + protocols.length;
  const pct = Math.round((done / total) * 100);

  useEffect(() => {
    hydrateProgress();
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2.5 text-fg no-underline">
            <span className="flex size-8 items-center justify-center rounded-sm bg-primary text-primary-fg">
              <Cpu className="size-4" strokeWidth={1.75} />
            </span>
            <span className="font-display text-lg tracking-tight">XOR Bench</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <p className="text-xs tabular-nums text-muted">
              {done}/{total} complete
            </p>
            <div className="h-1 w-28 overflow-hidden rounded-full bg-bg-warm">
              <div
                className="h-full bg-accent transition-[width] duration-300 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-0 md:gap-8">
        <aside
          className={cn(
            "flex w-72 flex-col overflow-y-auto border-r border-border bg-surface pt-14 shadow-[var(--shadow-border)]",
            "fixed inset-y-0 left-0 z-50",
            "md:static md:z-0 md:w-56 md:border-0 md:bg-transparent md:pt-8 md:shadow-none",
            open ? "flex" : "hidden md:flex",
          )}
        >
          <nav className="flex flex-col gap-0.5 px-3 pb-10 md:px-4">
            <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
              Notebook
            </p>
            {NAV.map((item) => {
              const href = item.params ? `/gates/${item.params.slug}` : item.to;
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === href || (item.to !== "/gates/$slug" && pathname.startsWith(`${item.to}/`));
              return (
                <Link
                  key={href}
                  to={item.to}
                  params={item.params}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-2 py-2 no-underline transition-colors duration-150",
                    active ? "bg-bg-warm text-fg" : "text-muted hover:bg-bg-warm/70 hover:text-fg",
                  )}
                >
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block text-xs text-subtle">{item.hint}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-fg/20 md:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
        ) : null}
        <main className="min-w-0 flex-1 px-4 py-8 md:px-2 md:pr-6 md:pt-8">{children}</main>
      </div>
    </div>
  );
}
