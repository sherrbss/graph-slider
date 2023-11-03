"use client";

import * as React from "react";
import { useHover, useMouse } from "ahooks";

function useMouseInElement(ref: React.RefObject<HTMLDivElement>) {
  const isHovering = useHover(ref);
  const mouse = useMouse(ref.current);

  return React.useMemo(
    () => ({
      isOutside: !isHovering,
      elementX: mouse.elementX,
      elementWidth: mouse.elementW,
      elementPositionX: mouse.elementPosX,
    }),
    [mouse, isHovering]
  );
}

export { useMouseInElement };
