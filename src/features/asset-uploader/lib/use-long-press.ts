"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

const DEFAULT_HOLD_DURATION = 500;

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick: () => void;
  delay?: number;
}

export function useLongPress({
  onLongPress,
  onClick,
  delay = DEFAULT_HOLD_DURATION,
}: UseLongPressOptions) {
  const timerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
  const [isPressing, setIsPressing] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const clear = (shouldHandleClick: boolean) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsPressing(false);

    if (shouldHandleClick && !longPressTriggeredRef.current) {
      onClick();
    }

    longPressTriggeredRef.current = false;
  };

  return {
    isPressing,
    bind: {
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
        if (event.button !== 0) {
          return;
        }

        longPressTriggeredRef.current = false;
        setIsPressing(true);
        timerRef.current = window.setTimeout(() => {
          longPressTriggeredRef.current = true;
          setIsPressing(false);
          onLongPress();
        }, delay);
      },
      onPointerUp: () => clear(true),
      onPointerLeave: () => clear(false),
      onPointerCancel: () => clear(false),
    },
  };
}
