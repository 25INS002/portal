import { useEffect, useState } from "react";

/**
 * Returns true only after the component
 * has mounted on the client.
 * Prevents hydration mismatch.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
