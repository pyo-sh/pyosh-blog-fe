"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@shared/lib/style-utils";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  withBackground?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  withBackground = false,
  className,
  children,
}) => {
  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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
        withBackground && "bg-grey-2 opacity-50",
      )}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "min-w-[21.875rem] min-h-[5rem] max-h-[85%]",
          "bg-background-2 text-text-1",
          "rounded-[10px]",
          "shadow-[0_10px_20px_rgba(0,0,0,0.19),0_0px_6px_rgba(0,0,0,0.22)]",
          "transition-all duration-300",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

Modal.displayName = "Modal";

export { Modal };
