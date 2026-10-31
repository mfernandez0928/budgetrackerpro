import { useEffect, useState } from "react";

export interface ChartColors {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  text: string;
  brand: string;
  pos: string;
  neg: string;
}

function readColors(): ChartColors {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string, alpha = 1) =>
    `rgb(${style.getPropertyValue(`--${name}`).trim()} / ${alpha})`;

  return {
    grid: token("line", 0.08),
    axis: token("muted"),
    tooltipBg: token("surface"),
    tooltipBorder: token("line", 0.12),
    text: token("text"),
    brand: token("brand"),
    pos: token("pos"),
    neg: token("neg"),
  };
}

// Recharts needs literal colors, so read the CSS tokens and re-read when the theme class flips.
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState(readColors);

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}
