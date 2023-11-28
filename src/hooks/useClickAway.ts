import { MutableRefObject, useEffect, useRef } from "react";

export default function useClickAway(
  cb: (e: MouseEvent | TouchEvent) => void
): MutableRefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);
  const refCb = useRef<(e: MouseEvent | TouchEvent) => void>(cb);

  useEffect(() => {
    refCb.current = cb;
  }, [cb]);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const element = ref.current;
      if (element && !element.contains(e.target as Node)) {
        refCb.current(e);
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  return ref;
}
