"use client";

import type { ChangeEvent, CompositionEvent } from "react";
import { useCallback, useRef } from "react";

interface UseImeSafeTextOptions {
  onCommit: (value: string) => void;
  transform?: (value: string) => string;
}

export function useImeSafeText<
  T extends HTMLInputElement | HTMLTextAreaElement,
>({ onCommit, transform = (value) => value }: UseImeSafeTextOptions) {
  const isComposingRef = useRef(false);

  const commitValue = useCallback(
    (value: string) => {
      onCommit(transform(value));
    },
    [onCommit, transform],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<T>) => {
      if (isComposingRef.current) {
        return;
      }

      commitValue(event.target.value);
    },
    [commitValue],
  );

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (event: CompositionEvent<T>) => {
      isComposingRef.current = false;
      commitValue(event.currentTarget.value);
    },
    [commitValue],
  );

  const resetComposition = useCallback(() => {
    isComposingRef.current = false;
  }, []);

  return {
    isComposingRef,
    handleChange,
    handleCompositionStart,
    handleCompositionEnd,
    resetComposition,
  };
}
