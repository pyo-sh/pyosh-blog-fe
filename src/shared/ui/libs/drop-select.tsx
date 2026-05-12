"use client";

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Icon } from "@iconify/react/offline";
import altArrowDownLinear from "@iconify-icons/solar/alt-arrow-down-linear";
import { cn } from "@shared/lib/style-utils";

export interface DropSelectOption<T extends string | number> {
  label: string;
  triggerLabel?: string;
  value: T;
  depth?: number;
}

interface DropSelectProps<T extends string | number> {
  value: T | null;
  options: Array<DropSelectOption<T>>;
  onChange: (value: T) => void;
  ariaLabel: string;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  triggerStyle?: CSSProperties;
  optionClassName?: string;
  listboxClassName?: string;
  iconClassName?: string;
  iconWidth?: string;
  showSelectedIndicator?: boolean;
  selectedIndicatorLabel?: string;
}

type DropSelectPlacement = "bottom" | "top";

interface ListboxLayout {
  placement: DropSelectPlacement;
  maxHeight?: number;
}

const LISTBOX_GAP_PX = 4;
const LISTBOX_VIEWPORT_MARGIN_PX = 8;

export function DropSelect<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
  id,
  name,
  placeholder,
  disabled,
  className,
  triggerClassName,
  triggerStyle,
  optionClassName,
  listboxClassName,
  iconClassName,
  iconWidth = "14",
  showSelectedIndicator = false,
  selectedIndicatorLabel = "선택됨",
}: DropSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [listboxLayout, setListboxLayout] = useState<ListboxLayout>({
    placement: "bottom",
  });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const visibleLabel =
    selected?.triggerLabel ?? selected?.label ?? placeholder ?? "";

  useEffect(() => {
    optionRefs.current = [];
  }, [options]);

  const updateListboxLayout = useCallback(() => {
    const trigger = triggerRef.current;
    const listbox = listboxRef.current;

    if (!trigger || !listbox) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow =
      viewportHeight -
      triggerRect.bottom -
      LISTBOX_GAP_PX -
      LISTBOX_VIEWPORT_MARGIN_PX;
    const spaceAbove =
      triggerRect.top - LISTBOX_GAP_PX - LISTBOX_VIEWPORT_MARGIN_PX;
    const preferredHeight = listbox.scrollHeight;
    const shouldOpenAbove =
      spaceBelow < preferredHeight && spaceAbove > spaceBelow;
    const availableSpace = shouldOpenAbove ? spaceAbove : spaceBelow;

    setListboxLayout({
      placement: shouldOpenAbove ? "top" : "bottom",
      maxHeight: Math.max(0, availableSpace),
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    updateListboxLayout();
  }, [isOpen, options, updateListboxLayout]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    window.addEventListener("resize", updateListboxLayout);
    window.addEventListener("scroll", updateListboxLayout, true);

    return () => {
      window.removeEventListener("resize", updateListboxLayout);
      window.removeEventListener("scroll", updateListboxLayout, true);
    };
  }, [isOpen, updateListboxLayout]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const next = optionRefs.current[activeIndex];
    if (!next) {
      return;
    }

    const frame = requestAnimationFrame(() => next.focus());

    return () => cancelAnimationFrame(frame);
  }, [activeIndex, isOpen]);

  function openList(index = selectedIndex >= 0 ? selectedIndex : 0) {
    setActiveIndex(
      Math.min(Math.max(index, 0), Math.max(options.length - 1, 0)),
    );
    setIsOpen(true);
  }

  function closeList(options: { focusTrigger?: boolean } = {}) {
    setIsOpen(false);
    if (options.focusTrigger) {
      triggerRef.current?.focus();
    }
  }

  function commitSelection(index: number) {
    const option = options[index];
    if (!option) {
      return;
    }

    onChange(option.value);
    closeList({ focusTrigger: true });
  }

  function moveActive(nextIndex: number) {
    const maxIndex = options.length - 1;
    if (maxIndex < 0) {
      return;
    }

    setActiveIndex(Math.min(Math.max(nextIndex, 0), maxIndex));
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openList(selectedIndex >= 0 ? selectedIndex : 0);

      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isOpen) {
        closeList();
      } else {
        openList(selectedIndex >= 0 ? selectedIndex : 0);
      }
    }
  }

  function handleOptionKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(index + 1);

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(index - 1);

      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveActive(0);

      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      moveActive(options.length - 1);

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeList({ focusTrigger: true });

      return;
    }

    if (event.key === "Tab") {
      closeList();

      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commitSelection(index);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      {name ? (
        <input type="hidden" name={name} value={value === null ? "" : value} />
      ) : null}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() =>
          isOpen
            ? closeList()
            : openList(selectedIndex >= 0 ? selectedIndex : 0)
        }
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "flex h-10 w-full items-center rounded-lg border border-border-3 bg-background-1 px-3 py-2 pr-8 text-left text-sm leading-5 text-text-1 outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          isOpen && "border-primary-1 ring-3 ring-primary-1/10",
          triggerClassName,
        )}
        style={triggerStyle}
      >
        <span className="truncate whitespace-nowrap">{visibleLabel}</span>
        <Icon
          icon={altArrowDownLinear}
          width={iconWidth}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-4 transition-transform",
            isOpen && "rotate-180",
            iconClassName,
          )}
        />
      </button>

      {isOpen ? (
        <div
          ref={listboxRef}
          className={cn(
            "absolute left-0 z-[200] min-w-full overflow-y-auto rounded-lg border border-border-3 bg-background-1 shadow-[0_4px_16px_rgba(0,0,0,0.1)]",
            listboxLayout.placement === "top"
              ? "bottom-[calc(100%+4px)]"
              : "top-[calc(100%+4px)]",
            listboxClassName,
          )}
          style={{
            maxHeight:
              listboxLayout.maxHeight === undefined
                ? undefined
                : `${listboxLayout.maxHeight}px`,
          }}
        >
          <div
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            className="py-0.5"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={String(option.value)}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={index === activeIndex ? 0 : -1}
                  onClick={() => commitSelection(index)}
                  onFocus={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  className={cn(
                    "flex w-full items-center whitespace-nowrap px-3 py-2 text-left text-sm leading-5 text-text-1 transition-colors hover:bg-background-2",
                    showSelectedIndicator && "justify-between gap-3",
                    isSelected && "font-medium text-primary-1",
                    optionClassName,
                  )}
                  style={{
                    paddingLeft: option.depth
                      ? `${12 + option.depth * 16}px`
                      : undefined,
                  }}
                >
                  <span className="truncate">{option.label}</span>
                  {showSelectedIndicator && isSelected ? (
                    <span className="shrink-0 text-[11px] text-primary-1">
                      {selectedIndicatorLabel}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
