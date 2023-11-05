"use client";

import React from "react";

import { largestTriangleThreeBucket } from "d3fc";
import { useSpring, SpringValue } from "@react-spring/web";
import { useElementSize } from "@/hooks/useElementSize";
import { interpolatePath } from "d3-interpolate-path";
import {
  curveBasis,
  curveBumpX,
  curveCatmullRom,
  curveLinear,
  curveLinearClosed,
  curveMonotoneX,
  curveNatural,
  line,
} from "d3-shape";
import { scaleLinear, scaleTime } from "d3-scale";
import { extent } from "d3-array";
import { useControls } from "leva";
import { useMount } from "ahooks";

type GraphContextData = {
  d: string;
  springProps: {
    t: SpringValue<number>;
  };
  springPropsGradient: {
    t: SpringValue<number>;
  };
  pathInterpolator: (t: number) => string;
  pathInterpolatorGradient: (t: number) => string;
  graphSlider: React.RefObject<HTMLDivElement>;
  dot: React.RefObject<HTMLDivElement>;
  parentWidth: number;
  parentHeight: number;
  parentLeft: number;
  getTimeFromX: (x: number) => number;
};

const GraphContext = React.createContext<GraphContextData>(
  {} as unknown as GraphContextData
);

export const GraphContextProvider: React.FC<
  React.PropsWithChildren<{
    data: [number, number][];
    style?: { paddingTop?: number; paddingBottom?: number };
  }>
> = ({ data: _data, style, children }) => {
  const { bucketSize, paddingTop, paddingBottom } = useControls({
    bucketSize: {
      min: 1,
      max: _data.length,
      value: 100,
    },
    paddingTop: {
      value: style?.paddingTop ?? 0,
    },
    paddingBottom: {
      value: style?.paddingBottom ?? 0,
    },
  });

  // Create the sampler
  const sampler = largestTriangleThreeBucket();

  // Configure the x / y value accessors
  sampler.x((d) => d[0]).y((d) => d[1]);

  // Configure the size of the buckets used to downsample the data.
  sampler.bucketSize(_data.length / bucketSize);

  // Run the sampler
  const data = sampler(_data);

  const graphSlider = React.useRef<HTMLDivElement>(null);
  const dot = React.useRef<HTMLDivElement>(null);

  /* parent sizing */
  const {
    width: parentWidth,
    height: parentHeight,
    left: parentLeft,
  } = useElementSize(graphSlider);

  /* bounds */
  const [minX, maxX] = extent(data, (d) => d[0]);
  const [minY, maxY] = extent(data, (d) => d[1]);

  /* close off the gradient */
  const dataGradient = [[minX, 0], ...data, [maxX, 0]] as [number, number][];

  /* scale paths */
  const scaleTimeToX = scaleTime().range([0, parentWidth]).domain([minX, maxX]);
  const scalePriceToY = scaleLinear()
    .range([parentHeight - paddingBottom, paddingTop])
    .domain([minY, maxY]);

  /* use d3-interpolate-path to interpolate even with different points */
  const pathD = line()
    .curve(curveBasis)
    .x(function (d) {
      return scaleTimeToX(d[0]); //using the scale here
    })
    .y(function (d) {
      let priceBefore = d[1];
      if (!!minY && priceBefore < minY) priceBefore = minY;
      if (!!maxY && priceBefore > maxY) priceBefore = maxY;
      return scalePriceToY(priceBefore);
    })(data);
  const pathDGradient = line()
    .curve(curveBasis)
    .x(function (d) {
      return scaleTimeToX(d[0]); //using the scale here
    })
    .y(function (d) {
      let priceBefore = d[1];
      if (!!minY && priceBefore < minY) priceBefore = minY;
      if (!!maxY && priceBefore > maxY) priceBefore = maxY;
      return scalePriceToY(priceBefore);
    })(dataGradient);

  /* keep track of last used pathD to interpolate from */
  const currD = React.useRef(pathD);
  const currDGradient = React.useRef(pathDGradient);

  /* create initial path interpolator */
  // const pathInterpolator = React.useMemo(
  //   () => interpolatePath(currD.current, pathD),
  //   [pathD]
  // );
  // const pathInterpolatorGradient = React.useMemo(
  //   () => interpolatePath(currDGradient.current, pathDGradient),
  //   [pathDGradient]
  // );

  /* create an interpolator that maps from t (0 to 1) to a path d string */
  const pathInterpolator = React.useMemo(
    () => interpolatePath(currD.current, pathD),
    [pathD]
  );
  const pathInterpolatorGradient = React.useMemo(
    () => interpolatePath(currDGradient.current, pathDGradient),
    [pathDGradient]
  );
  const strokeDashOffsetInterpolator = React.useMemo(
    () => (t: number) => t * parentWidth,
    [parentWidth]
  );
  const strokeDashOffsetInterpolatorGradient = React.useMemo(
    () => (t: number) => t * parentWidth,
    [parentWidth]
  );

  const [mounted, setMounted] = React.useState(false);
  // const [initialAnimationDone, setInitialAnimationDone] = React.useState(false);
  // const [initialGradientAnimationDone, setInitialGradientAnimationDone] =
  //   React.useState(false);
  const initialAnimationDoneRef = React.useRef(false);
  const initialGradientAnimationDoneRef = React.useRef(false);
  // const [initialAnimationDone, setInitialAnimationDone] = React.useState(false);
  // const [initialGradientAnimationDone, setInitialGradientAnimationDone] = React.useState(false);
  useMount(() => setTimeout(() => setMounted(true), 1000));

  const [strokeDashOffset, setStrokeDashOffset] = React.useState(0);
  const [strokeDashOffsetGradient, setStrokeDashOffsetGradient] =
    React.useState(0);
  const currStrokeDashOffset = React.useRef(strokeDashOffset);
  const currStrokeDashOffsetGradient = React.useRef(strokeDashOffsetGradient);

  /* create a spring that maps from t = 0 (start animation) to t = 1 (end of animation) */
  const springProps = useSpring({
    immediate: !mounted,
    from: { t: 0 },
    to: { t: 1 },
    reset: initialAnimationDoneRef.current && currD.current !== pathD,
    onChange: (result) => {
      if (initialAnimationDoneRef.current) {
        currD.current = pathInterpolator(result.value.t);
      } else {
        currD.current = pathD;
      }
    },
    onRest: () => {
      if (!initialAnimationDoneRef.current) {
        console.log("INITIAL DONE");
        initialAnimationDoneRef.current = true;
      }
    },
  });
  const springPropsGradient = useSpring({
    immediate: !mounted,
    from: { t: 0 },
    to: { t: 1 },
    reset:
      initialGradientAnimationDoneRef.current &&
      currDGradient.current !== pathDGradient,
    onChange: (result) => {
      if (initialGradientAnimationDoneRef.current) {
        currDGradient.current = pathInterpolatorGradient(result.value.t);
      } else {
        currDGradient.current = pathDGradient;
      }
    },
    onRest: () => {
      if (!initialGradientAnimationDoneRef.current) {
        console.log("INITIAL GRADIENT DONE");
        initialGradientAnimationDoneRef.current = true;
      }
    },
  });

  // const initialClipPathRef = React.useRef(false);
  // const springPropsClipPath = useSpring({
  //   immediate: !mounted,
  //   from: { t: 0 },
  //   to: { t: 1 },
  //   reset: !initialClipPathRef.current,
  //   onChange: (result) => {
  //     const x = strokeDashOffsetInterpolator(result.value.t);
  //     const val = `inset(0 ${parentWidth - x - 2 * 2}px 0 0)`;
  //     console.log("CLIP PATH", val);
  //     setClipPath(val);
  //     // if (initialGradientAnimationDoneRef.current) {
  //     //   currDGradient.current = pathInterpolatorGradient(result.value.t);
  //     // } else {
  //     //   currDGradient.current = pathDGradient;
  //     // }
  //   },
  //   onRest: () => {
  //     if (!initialClipPathRef.current) {
  //       console.log("INITIAL CLIP PATH DONE");
  //       initialClipPathRef.current = true;
  //     }
  //   },
  // });

  // TODO - fixme - this is hacky
  const getTimeFromX = React.useCallback(
    (x: number) => {
      const percentage = x / parentWidth;
      const clampedPercentage = Math.min(Math.max(percentage, 0), 1);
      const index = Math.floor(clampedPercentage * data.length);

      if (Number.isNaN(index)) return data[0][0];
      if (index >= data.length) return data[data.length - 1][0];
      return data[index][0];
    },
    [data, parentWidth]
  );

  const value = React.useMemo(
    () => ({
      d: pathD,
      springProps,
      springPropsGradient,
      pathInterpolator,
      pathInterpolatorGradient,
      graphSlider,
      dot,
      parentWidth,
      parentHeight,
      parentLeft,
      getTimeFromX,
    }),
    [
      pathD,
      springProps,
      springPropsGradient,
      pathInterpolator,
      pathInterpolatorGradient,
      graphSlider,
      dot,
      parentWidth,
      parentHeight,
      parentLeft,
      getTimeFromX,
    ]
  );

  return (
    <GraphContext.Provider value={value}>{children}</GraphContext.Provider>
  );
};

export const useGraphContext = (): GraphContextData =>
  React.useContext(GraphContext);

export default GraphContext;
