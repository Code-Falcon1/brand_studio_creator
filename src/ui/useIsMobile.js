import { useEffect, useState } from 'react';

export default function useIsMobile(breakpointPx = 1100) {
  const query = `(max-width: ${breakpointPx}px)`;
  const [mobile, setMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.(query)?.matches ?? window.innerWidth <= breakpointPx;
  });

  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    function onChange(e) {
      setMobile(Boolean(e.matches));
    }
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [query]);

  return mobile;
}

