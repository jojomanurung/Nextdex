import { useEffect, useState } from "react";

// Returns `value` delayed by `delay` ms — it only updates once the input has
// stopped changing for that long. Used to keep search from refiltering per key.
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
