"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { cn } from "@shared/lib/style-utils";

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface SlideInPanelProps {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
  topOffset?: string;
}

export function SlideInPanel({
  isOpen,
  onClose,
  id,
  label = "사이드 패널",
  children,
  className,
  topOffset,
}: SlideInPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const panelStyle: CSSProperties | undefined = topOffset
    ? { top: topOffset }
    : undefined;

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    focusable[0]?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        e.shiftKey
          ? document.activeElement === first
          : document.activeElement === last
      ) {
        e.preventDefault();
        (e.shiftKey ? last : first)?.focus();
      }
    };

    document.addEventListener("keydown", trap);

    return () => document.removeEventListener("keydown", trap);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);

    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <aside
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        style={panelStyle}
        className={cn(
          "fixed right-0 z-50 w-80 max-w-[85vw] bottom-0",
          topOffset ? undefined : "top-0",
          "bg-background-1 border-l border-border-3",
          "overflow-y-auto",
          "animate-[var(--animate-slide-in-right)]",
          className,
        )}
      >
        {children}
      </aside>
    </>
  );
}
