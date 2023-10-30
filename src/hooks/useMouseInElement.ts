"use client";

import * as React from "react";

function useElementSize(ref: React.RefObject<HTMLDivElement>) {
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setSize({
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight,
        });
      }
    };

    if (ref.current) {
      handleResize();
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [ref, setSize]);

  return size;
}

export { useElementSize };
