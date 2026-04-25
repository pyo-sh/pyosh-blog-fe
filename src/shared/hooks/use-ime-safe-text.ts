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

  const commitTransformedValue = useCallback(
    (value: string) => {
      onCommit(transform(value));
    },
    [onCommit, transform],
  );

  const commitRawValue = useCallback(
    (value: string) => {
      onCommit(value);
    },
    [onCommit],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<T>) => {
      if (isComposingRef.current) {
        commitRawValue(event.target.value);

        return;
      }

      commitTransformedValue(event.target.value);
    },
    [commitRawValue, commitTransformedValue],
  );

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (event: CompositionEvent<T>) => {
      isComposingRef.current = false;
      commitTransformedValue(event.currentTarget.value);
    },
    [commitTransformedValue],
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
