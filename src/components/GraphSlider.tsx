"use client";

import React from "react";

import { useSpring, easings } from "@react-spring/web";
import { useMouseInElement } from "@/hooks/useElementSize";
import { useElementSize } from "@/hooks/useMouseInElement";

const STROKE_DEFINITION =
  "M3.39622 186.948H14.5303C15.2314 186.948 15.8936 186.626 16.3265 186.074L22.9168 177.677C23.7626 176.599 25.3603 176.504 26.3284 177.473L41.5721 192.734C42.0003 193.163 42.5815 193.404 43.1875 193.404H59.2312C59.7142 193.404 60.1848 193.25 60.5752 192.966L67.1611 188.171C68.1134 187.478 69.4369 187.622 70.2166 188.506L77.3631 196.6C78.1747 197.519 79.5674 197.633 80.5177 196.858L104.823 177.037C105.774 176.262 107.166 176.376 107.978 177.296L114.65 184.853C115.606 185.935 117.314 185.87 118.184 184.718L128.222 171.429C128.526 171.026 128.956 170.736 129.443 170.603L145.259 166.284C145.988 166.085 146.572 165.538 146.817 164.823L153.829 144.402C154.053 143.749 154.56 143.233 155.208 142.998L166.644 138.834C167.184 138.638 167.629 138.245 167.893 137.734L172.184 129.402C173.018 127.782 175.32 127.744 176.208 129.335L187.56 149.68C188.121 150.686 189.343 151.116 190.41 150.685L207.469 143.784C208.115 143.523 208.607 142.981 208.803 142.312L221.178 100.267C221.522 99.098 222.723 98.4051 223.907 98.6925L233.424 101.002C234.412 101.242 235.44 100.8 235.945 99.9176L244.91 84.2513C245.585 83.071 247.136 82.7391 248.236 83.5395L252.888 86.9272C254.02 87.7515 255.621 87.3718 256.262 86.1268L256.756 85.1683C257.513 83.698 259.534 83.4954 260.568 84.7861L271.18 98.0327C272.328 99.4649 274.61 99.0268 275.146 97.2716L286.424 60.3201C286.827 59.0008 288.298 58.337 289.554 58.9083L303.47 65.2413C304.34 65.6371 305.364 65.4495 306.037 64.7711L318.656 52.0495C319.085 51.6173 319.668 51.3741 320.277 51.3741H338.657C339.679 51.3741 340.576 52.053 340.854 53.0362L346.821 74.1388C347.347 75.9985 349.802 76.4046 350.899 74.8132L362.604 57.83";
const GRADIENT_DEFINITION =
  "M15.0855 186.948H1.23236V210.063C1.23236 210.694 1.74349 211.205 2.374 211.205H363.626C364.257 211.205 364.768 210.694 364.768 210.063V57.83L349.529 77.0623C348.95 77.7922 347.789 77.56 347.535 76.664L340.619 52.2052C340.48 51.7136 340.032 51.3741 339.521 51.3741H319.801C319.497 51.3741 319.205 51.4957 318.991 51.7118L305.477 65.3355C305.141 65.6747 304.629 65.7685 304.194 65.5706L288.369 58.3692C287.741 58.0835 287.005 58.4154 286.804 59.075L274.515 99.3394C274.247 100.217 273.106 100.436 272.532 99.72L259.467 83.4128C258.95 82.7675 257.94 82.8688 257.561 83.6039L255.652 87.3111C255.331 87.9336 254.531 88.1235 253.965 87.7113L247.205 82.7895C246.656 82.3893 245.88 82.5553 245.543 83.1454L235.518 100.662C235.266 101.104 234.752 101.325 234.258 101.205L222.849 98.4359C222.257 98.2922 221.657 98.6386 221.485 99.223L208.648 142.841C208.549 143.176 208.304 143.447 207.981 143.577L189.476 151.062C188.942 151.278 188.331 151.063 188.051 150.56L175.171 127.476C174.727 126.68 173.576 126.699 173.159 127.509L167.688 138.131C167.556 138.387 167.333 138.583 167.063 138.681L154.695 143.184C154.371 143.302 154.118 143.56 154.006 143.886L146.621 165.395C146.498 165.752 146.207 166.026 145.842 166.125L129.067 170.705C128.824 170.772 128.609 170.917 128.457 171.119L117.342 185.833C116.907 186.409 116.053 186.442 115.575 185.9L107.181 176.393C106.805 175.967 106.172 175.883 105.697 176.196L79.4636 193.499C79.0728 193.756 78.5642 193.749 78.1806 193.481L69.5088 187.415C69.1093 187.135 68.5765 187.14 68.1824 187.427L60.2748 193.185C60.0795 193.327 59.8443 193.404 59.6028 193.404H42.7142C42.4112 193.404 42.1206 193.283 41.9065 193.069L25.4179 176.561C24.9339 176.077 24.135 176.124 23.7121 176.663L15.9836 186.511C15.7672 186.787 15.4361 186.948 15.0855 186.948Z";

const WIDTH = 366;
const HEIGHT = 213;
const LINE_WIDTH = 2;
const DOT_SIZE = 16;

function GraphSlider() {
  const graphSlider = React.useRef<HTMLDivElement>(null);
  const dot = React.useRef<HTMLDivElement>(null);

  const { width: parentWidth } = useElementSize(graphSlider);
  const { elementPositionX: parentLeft } = useMouseInElement(graphSlider);

  const isPointerOverRef = React.useRef(false);

  /* position of mouse within screen */
  const [_flag, setFlag] = React.useState<number>(0);
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
    if (
      Number.isNaN(parentX) ||
      parentWidth === 0 ||
      (parentX < 0 && clientX === 0)
    ) {
      return {
        hour: "7",
        minute: "00",
      };
    }

    const percentage = parentX / parentWidth;
    const percentToMinutes = Math.floor(percentage * 60);

    if (percentToMinutes >= 25) {
      return {
        hour: "8",
        minute: (percentToMinutes - 25).toString().padStart(2, "0"),
      };
    } else {
      return {
        hour: "7",
        minute: percentToMinutes.toString().padStart(2, "0"),
      };
    }
  }, [parentX, parentWidth, clientX]);

  /* interpolate the mouse position */
  const [{ interpolatedClientX }] = useSpring(
    () => ({
      interpolatedClientX: 0,
      config: {
        easing: easings.easeInElastic,
      },
    }),
    []
  );

  /**
   * Handles mouse event events.
   *
   * @param e - mouse event
   */
  const onMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    interpolatedClientX.set(clientX);
    interpolatedClientX.start(e.clientX, {
      onChange: (result) => {
        setClientX(result as unknown as number);
      },
      onRest: () => {
        isPointerOverRef.current = true;
        const interval = setInterval(() => setFlag((prev) => prev + 1), 25);
        setTimeout(() => clearInterval(interval), 100);
      },
      config: {
        duration: (Math.abs(e.clientX - clientX) / parentWidth) * 200,
      },
    });
  };

  /**
   * Handles mouse move events.
   *
   * @param e - mouse event
   */
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPointerOverRef.current) {
      setClientX(e.clientX);
    }

    // TODO - setDate
  };

  /**
   * Handles mouse leave events.
   *
   * @param e - mouse event
   */
  const onMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    interpolatedClientX.set(e.clientX);
    interpolatedClientX.start(parentLeft + parentWidth, {
      onChange: (result) => {
        setClientX(result as unknown as number);
      },
      onRest: () => {
        isPointerOverRef.current = false;
        const interval = setInterval(() => setFlag((prev) => prev + 1), 25);
        setTimeout(() => clearInterval(interval), 100);
      },
      config: {
        duration:
          (Math.abs(parentLeft + parentWidth - e.clientX) / parentWidth) * 200,
      },
    });
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
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {/* TIME */}
        <div
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
            {`${date.hour}:${date.minute}`} AM
          </div>
        </div>

        {/* DOT */}
        <div
          data-dot-indicator
          ref={dot}
          style={{
            offsetPath: `path("${STROKE_DEFINITION}")`,
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

        <svg width={WIDTH} height={HEIGHT} viewBox="0 0 366 213" fill="none">
          {/* GRADIENT */}
          <path d={GRADIENT_DEFINITION} fill="url(#gradient-grayscale)" />
          <path
            d={GRADIENT_DEFINITION}
            fill="url(#gradient-color)"
            style={{ clipPath }}
          />

          {/* PATH */}
          <g strokeWidth="2.2" strokeLinecap="round">
            <path d={STROKE_DEFINITION} stroke="var(--gray-7)" />
            <path
              d={STROKE_DEFINITION}
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
              <stop stopColor="var(--gray-6)" stopOpacity="0.5" />
              <stop offset="1" stopColor="var(--gray-6)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default GraphSlider;
