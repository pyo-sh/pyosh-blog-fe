"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@shared/lib/style-utils";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  withBackground?: boolean;
  className?: string;
  children?: React.ReactNode;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  withBackground = false,
  className,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousActiveElementRef.current =
      document.activeElement as HTMLElement | null;

    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusFirstElement = () => {
      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute("disabled"));

      const firstElement = focusableElements[0] ?? dialog;
      firstElement.focus();
    };

    const timer = window.setTimeout(focusFirstElement, 0);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();

        return;
      }

      if (e.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) {
        e.preventDefault();
        dialog.focus();

        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && wasOpenRef.current) {
      previousActiveElementRef.current?.focus();
      previousActiveElementRef.current = null;
    }

    wasOpenRef.current = isOpen;
  }, [isOpen]);

  // body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={cn(
        // Base styles
        "fixed inset-0 z-50",
        "flex items-center justify-center",
        "text-center",
        "transition-colors duration-[400ms]",
        // Background overlay
        withBackground && "bg-grey-2/50",
      )}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className={cn(
          "min-w-[21.875rem] min-h-[5rem] max-h-[85%]",
          "bg-background-2 text-text-1",
          "rounded-[10px]",
          "shadow-[0_10px_20px_rgba(0,0,0,0.19),0_0px_6px_rgba(0,0,0,0.22)]",
          "transition-all duration-300",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

Modal.displayName = "Modal";

export { Modal };
