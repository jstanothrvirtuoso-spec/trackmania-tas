
import { useState } from "react";

type Point = {
  date: string;
  time_ms: number;
};

const width = 700;
const height = 420;
const xPadding = 35;
const yPadding = 20;
const yTicks = [0, 600000, 1200000, 1800000, 2400000, 3000000, 3600000, 4200000] as const;

export function TmnfHistoryGraph({ points }: { points: Point[];}) {

  const [maxDate] = useState<number>(() => Date.now());

  if (!points.length) return null;
  
  const firstDate = new Date(points[2].date).getTime();
  const lastDate = new Date(points[points.length - 1].date).getTime();
  const datePadding = Math.max((lastDate - firstDate) * 0.05, 1000 * 60 * 60 * 24 * 30);
  const minDate = firstDate - datePadding;
  const startYear = new Date(minDate).getFullYear();
  const endYear = new Date(maxDate).getFullYear();

  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );
  
  const xScale = (date: string) => {
    const t = new Date(date).getTime();
    return (
      xPadding +
      ((t - minDate) / (maxDate - minDate || 1)) * (width - xPadding * 1.5)
    );
  };

  const yScale = (v: number) => {
    const chartMin = yTicks[0];
    const chartMax = yTicks[yTicks.length - 1];

    return (
      height -
      yPadding -
      ((v - chartMin) / (chartMax - chartMin || 1)) * (height - yPadding * 2)
    );
  };

  let path = "";

  points.forEach((p, i) => {
    const x = xScale(p.date);
    const y = yScale(p.time_ms);

    if (i === 0) path += `M ${x} ${y}`;
    else path += ` L ${x} ${y}`;
  });

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        Cumulative Time Saved (Mins)
      </h2>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[420px]">
        {/* axes */}
        <line
          x1={xPadding}
          y1={height - yPadding}
          x2={width - xPadding / 2}
          y2={height - yPadding}
          className="stroke-slate-600"
        />

        <line
          x1={xPadding}
          y1={yPadding}
          x2={xPadding}
          y2={height - yPadding}
          className="stroke-slate-600"
        />

        {/* y ticks */}
        {yTicks.map((tick) => {
          const y = yScale(tick);

          return (
            <g key={tick}>
              <line
                x1={xPadding}
                y1={y}
                x2={width - xPadding / 2}
                y2={y}
                className="stroke-slate-800"
              />

              <text
                x={xPadding - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px]"
              >
                {Math.round(tick / 60000)}
              </text>
            </g>
          );
        })}
        
        {/* x ticks */}
        {years.map((year) => {
          const x = xScale(`${year}-01-01`);

          if (x < xPadding || x > width - xPadding) return null;

          return (
            <g key={year}>
              <line
                x1={x}
                y1={yPadding}
                x2={x}
                y2={height - yPadding}
                className="stroke-slate-800"
              />

              <text
                x={x}
                y={height - yPadding + 16}
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                {year}
              </text>
            </g>
          );
        })}

        {/* line */}
        <path
          d={path}
          fill="none"
          stroke="#34d399"
          strokeWidth="2"
        />

        {/* points */}
        {points.map((p) => (
          <circle
            key={`${p.date}-${p.time_ms}`}
            cx={xScale(p.date)}
            cy={yScale(p.time_ms)}
            r={3}
            fill="#34d399"
          />
        ))}
      </svg>
    </div>
  );
}
