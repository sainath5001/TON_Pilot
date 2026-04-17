"use client";

import { useEffect, useState } from "react";

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value, hydrated]);

  // Support both direct values and functional updates.
  function setValueSafe(next: T | ((prev: T) => T)) {
    setValue((prev) => (typeof next === "function" ? (next as (p: T) => T)(prev) : next));
  }

  return { value, setValue: setValueSafe, hydrated } as const;
}

