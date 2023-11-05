"use client";

import * as React from "react";

function useElementSize(ref: React.RefObject<HTMLDivElement>) {
  const [size, setSize] = React.useState({ width: 0, height: 0, left: 0 });

  React.useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        // const boundingBox = ;
        // console.log("BOUNDING", { boundingBox });
        setSize((prev) => ({
          left: ref.current?.getBoundingClientRect().x ?? prev.left,
          width: ref.current?.offsetWidth ?? prev.width,
          height: ref.current?.offsetHeight ?? prev.height,
        }));
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
