"use client";

import React from "react";

import { animated, easings, to, useSpring } from "@react-spring/web";
import { useMouseInElement } from "@/hooks/useElementSize";
import { DUMMY_30D_CHART_DATA, DUMMY_7D_CHART_DATA } from "@/lib/data";
import {
  GraphContextProvider,
  useGraphContext,
} from "@/providers/GraphProvider";
import { useControls } from "leva";
import moment from "moment";

const WIDTH = 366;
const HEIGHT = 213;
const LINE_WIDTH = 2;
const DOT_SIZE = 16;

const chartData = [
  DUMMY_7D_CHART_DATA[0].map((d) => [d.time, d.value]) as [number, number][],
  DUMMY_30D_CHART_DATA[0].map((d) => [d.time, d.value]) as [number, number][],
];

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(value: { r: number; g: number; b: number }) {
  return (
    "#" +
    componentToHex(value.r) +
    componentToHex(value.g) +
    componentToHex(value.b)
  );
}
const GraphSliderV2Internals: React.FC<
  React.PropsWithChildren<{ data?: [number, number][] }>
> = ({ data: _data }) => {
  // const {
  //   hoverGradientTopColor,
  //   hoverGradientTopOpacity,
  //   hoverGradientBottomColor,
  //   hoverGradientBottomOpacity,
  //   gradientTopColor,
  //   gradientTopOpacity,
  //   gradientBottomColor,
  //   gradientBottomOpacity,
  // } = useControls({
  //   hoverGradientTopColor: {
  //     value: {
  //       r: 0.417 * 255,
  //       g: 0.341 * 255,
  //       b: 0.784 * 255,
  //     },
  //   },
  //   hoverGradientTopOpacity: {
  //     value: 0.225,
  //   },
  //   hoverGradientBottomColor: {
  //     value: {
  //       r: 0.417 * 255,
  //       g: 0.341 * 255,
  //       b: 0.784 * 255,
  //     },
  //   },
  //   hoverGradientBottomOpacity: {
  //     value: 0,
  //   },
  //   gradientTopColor: {
  //     value: {
  //       r: 0.849 * 255,
  //       g: 0.849 * 255,
  //       b: 0.849 * 255,
  //     },
  //   },
  //   gradientTopOpacity: {
  //     value: 0.5,
  //   },
  //   gradientBottomColor: {
  //     value: {
  //       r: 0.849 * 255,
  //       g: 0.849 * 255,
  //       b: 0.849 * 255,
  //     },
  //   },
  //   gradientBottomOpacity: {
  //     value: 0,
  //   },
  // });

  const {
    d: pathD,
    springProps,
    springPropsGradient,
    pathInterpolator,
    pathInterpolatorGradient,
    graphSlider,
    dot,
    parentWidth,
    parentHeight,
    getTimeFromX,
  } = useGraphContext();

  const { elementPositionX: parentLeft, isOutside } =
    useMouseInElement(graphSlider);

  /* position of mouse within screen */
  const [clientX, setClientX] = React.useState<number>(0);
  const dotX = dot.current?.getBoundingClientRect().x ?? 0;

  /* relative position of mouse within parent */
  const parentX = clientX - parentLeft;

  /* compute the difference between the center of the dot and the cursor position */
  const x = parentX + (dotX + (DOT_SIZE + 2) / 2 - clientX) - LINE_WIDTH / 2;

  /* inset the active line and gradient */
  const clipPath = `inset(0 ${parentWidth - x - LINE_WIDTH * 2}px 0 0)`;

  /* assemble the date */
  const date = React.useMemo(() => {
    return moment.unix(getTimeFromX(x)).format("MMM D YYYY h:mm a");
  }, [x, getTimeFromX]);

  /* interpolate the mouse position */
  const isPointerOverRef = React.useRef(false);
  const isInitialAnimationCompleteRef = React.useRef(false);
  const isExitAnimationCompleteRef = React.useRef(false);
  const [_flag, setFlag] = React.useState<number>(0);
  const [{ interpolatedClientX }] = useSpring(
    () => ({
      interpolatedClientX: 0,
      config: {
        easing: easings.easeOutQuint,
      },
    }),
    []
  );

  /**
   * Handles mouse event events.
   *
   * @param e - mouse event
   */
  const onMouseEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerOverRef.current = true;

    if (isExitAnimationCompleteRef.current) {
      isExitAnimationCompleteRef.current = false;
      interpolatedClientX.set(clientX);
    }

    interpolatedClientX.start(e.clientX, {
      onChange: (result) => {
        setClientX(result as unknown as number);
      },
      onRest: () => {
        isInitialAnimationCompleteRef.current = true;
        const interval = setInterval(() => setFlag((prev) => prev + 1), 25);
        setTimeout(() => clearInterval(interval), 100);
      },
      config: {
        duration: (Math.abs(e.clientX - clientX) / parentWidth) * 400,
      },
    });
  };

  /**
   * Handles mouse move events.
   *
   * @param e - mouse event
   */
  const onMouseMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      isInitialAnimationCompleteRef.current &&
      isExitAnimationCompleteRef.current
    ) {
      setClientX(e.clientX);
    } else {
      interpolatedClientX.start(e.clientX, {
        onChange: (result) => {
          setClientX(result as unknown as number);
        },
        onRest: () => {
          const interval = setInterval(() => setFlag((prev) => prev + 1), 25);
          setTimeout(() => clearInterval(interval), 100);
        },
        config: {
          duration: (Math.abs(e.clientX - clientX) / parentWidth) * 400,
        },
      });
    }
  };

  /**
   * Handles mouse leave events.
   *
   * @param e - mouse event
   */
  const onMouseLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerOverRef.current = false;

    if (isInitialAnimationCompleteRef.current) {
      isInitialAnimationCompleteRef.current = false;
      interpolatedClientX.set(e.clientX);
    }

    interpolatedClientX.start(parentLeft + parentWidth, {
      onChange: (result) => {
        setClientX(result as unknown as number);
      },
      onRest: () => {
        isExitAnimationCompleteRef.current = true;
        const interval = setInterval(() => setFlag((prev) => prev + 1), 25);
        setTimeout(() => clearInterval(interval), 100);
      },
      config: {
        duration:
          (Math.abs(parentLeft + parentWidth - e.clientX) / parentWidth) * 400,
      },
    });
  };

  /**
   * Handles mouse move events.
   *
   * @param e - mouse event
   */
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // setClientX(e.touches[0].clientX);
    // TODO - setDate
  };

  return (
    <div
      style={{
        marginTop: "32px",
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        position: "relative",
      }}
    >
      <div
        ref={graphSlider}
        style={{
          position: "relative",
          cursor: "none",
          boxSizing: "border-box",
          margin: "0 !important",
          width: "100%",
          height: "100%",
        }}
        onPointerEnter={onMouseEnter}
        onPointerMove={onMouseMove}
        onTouchMove={onTouchMove}
        onPointerLeave={onMouseLeave}
      >
        {/* TIME */}
        <animated.div
          data-vertical-indicator
          style={{
            transform: `translateX(${x}px)`,
            width: "2px",
            height: "100%",
            position: "absolute",
            boxSizing: "border-box",
            margin: "0",
            background: "var(--gray-7)",
          }}
        >
          <div
            style={{
              // "--height": "24px",
              height: "24px",
              borderRadius: "999em",
              lineHeight: "24px",
              background: "var(--gray-6)",
              paddingLeft: "8px",
              paddingRight: "8px",
              position: "absolute",
              left: "50%",
              fontFamily: "sans-serif",
              fontSize: "13px",
              color: "var(--gray-12)",
              whiteSpace: "nowrap",
              transform: "translateX(-50%)",
            }}
          >
            {date}
          </div>
        </animated.div>

        {/* DOT */}
        <animated.div
          data-dot-indicator
          ref={dot}
          style={{
            offsetPath: `path("${pathD}")`,
            offsetDistance: (parentX / parentWidth) * 100 + "%",
            width: `${DOT_SIZE}px`,
            height: `${DOT_SIZE}px`,
            position: "absolute",
            boxShadow:
              "rgb(255,255,255) 0px 0px 0px 2px, rgba(0,0,0,0.12) 0px 0px 8px 2px",
            borderRadius: "50%",
            backgroundColor: "var(--violet-9)",
            boxSizing: "border-box",
          }}
        />

        <svg
          width={parentWidth}
          height={parentHeight}
          // viewBox={`0 0 ${parentWidth} ${parentHeight}`}
          fill="none"
        >
          {/* GRADIENT */}
          <animated.path
            d={to(springPropsGradient.t, pathInterpolatorGradient)}
            fill="url(#gradient-grayscale)"
          />
          <animated.path
            d={to(springPropsGradient.t, pathInterpolatorGradient)}
            fill="url(#gradient-color)"
            style={{ clipPath }}
          />

          {/* PATH */}
          <g strokeWidth="2.2" strokeLinecap="round">
            <animated.path
              d={to(springProps.t, pathInterpolator)}
              stroke="var(--gray-7)"
            />
            <animated.path
              d={to(springProps.t, pathInterpolator)}
              stroke="var(--violet-9)"
              style={{ clipPath }}
            />
          </g>

          {/* GRADIENT DEFINITIONS */}
          <defs>
            <linearGradient
              id="gradient-color"
              x1="183"
              y1="51.3741"
              x2="183"
              y2="211.205"
              gradientUnits="userSpaceOnUse"
            >
              {/* <stop
                stopColor={rgbToHex(hoverGradientTopColor)}
                stopOpacity={hoverGradientTopOpacity}
              />
              <stop
                offset="1"
                stopColor={rgbToHex(hoverGradientBottomColor)}
                stopOpacity={hoverGradientBottomOpacity}
              /> */}
              <stop stopColor="var(--violet-9)" stopOpacity="0.225" />
              <stop offset="1" stopColor="var(--violet-9)" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="gradient-grayscale"
              x1="183"
              y1="51.3741"
              x2="183"
              y2="211.205"
              gradientUnits="userSpaceOnUse"
            >
              {/* <stop
                stopColor={rgbToHex(gradientTopColor)}
                stopOpacity={gradientTopOpacity}
              />
              <stop
                offset="1"
                stopColor={rgbToHex(gradientBottomColor)}
                stopOpacity={gradientBottomOpacity}
              /> */}
              <stop stopColor="var(--gray-6)" stopOpacity="0.5" />
              <stop offset="1" stopColor="var(--gray-6)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

function GraphSliderV2() {
  const [index, setIndex] = React.useState(0);
  const data = React.useMemo(() => chartData[index], [index]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginTop: "32px",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          width: "100%",
          height: "100%",
        }}
      >
        <button
          style={{
            fontWeight: 500,
            ...(index === 0 && {
              fontWeight: 500,
              textDecoration: "underline",
            }),
          }}
          onClick={() => setIndex(0)}
        >
          1w
        </button>
        <button
          style={{
            fontWeight: 500,
            ...(index === 1 && {
              fontWeight: 500,
              textDecoration: "underline",
            }),
          }}
          onClick={() => setIndex(1)}
        >
          1m
        </button>
      </div>
      <GraphContextProvider
        data={data}
        style={{ paddingTop: 72, paddingBottom: 0 }}
      >
        <GraphSliderV2Internals />
      </GraphContextProvider>
    </div>
  );
}

export default GraphSliderV2;
