"use client";

import React from "react";

import { largestTriangleThreeBucket } from "d3fc";
import { useSpring, SpringValue } from "@react-spring/web";
import { useElementSize } from "@/hooks/useMouseInElement";
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
  const { width: parentWidth, height: parentHeight } =
    useElementSize(graphSlider);

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

  /* create an interpolator that maps from t (0 to 1) to a path d string */
  const pathInterpolator = React.useMemo(
    () => interpolatePath(currD.current, pathD),
    [pathD]
  );
  const pathInterpolatorGradient = React.useMemo(
    () => interpolatePath(currDGradient.current, pathDGradient),
    [pathDGradient]
  );

  /* create a spring that maps from t = 0 (start animation) to t = 1 (end of animation) */
  const springProps = useSpring({
    from: { t: 0 },
    to: { t: 1 },
    // reset t to 0 when the path changes so we can begin interpolating anew
    reset: currD.current !== pathD,
    // when t updates, update the last seen D so we can handle interruptions
    onChange: (result) => {
      currD.current = pathInterpolator(result.value.t);
    },
  });
  const springPropsGradient = useSpring({
    from: { t: 0 },
    to: { t: 1 },
    reset: currDGradient.current !== pathDGradient,
    onChange: (result) => {
      currDGradient.current = pathInterpolatorGradient(result.value.t);
    },
  });

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
