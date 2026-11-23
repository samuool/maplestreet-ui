type SparklineProps = {
  values: (number | null)[];
  label: string;
  className?: string;
};

export function Sparkline({ values, label, className = "text-tertiary" }: SparklineProps) {
  const valid = values.filter((value): value is number => value !== null);
  if (valid.length < 2) return null;

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const segments: { x: number; y: number }[][] = [];
  let segment: { x: number; y: number }[] = [];
  values.forEach((value, index) => {
    if (value === null) {
      if (segment.length) segments.push(segment);
      segment = [];
    } else {
      segment.push({
        x: 2 + (index / (values.length - 1)) * 92,
        y: max === min ? 18 : 4 + (1 - (value - min) / (max - min)) * 28,
      });
    }
  });
  if (segment.length) segments.push(segment);

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 96 40"
      className={`h-10 w-24 shrink-0 ${className}`}
    >
      {segments.map((points, index) => {
        const line = points.map(({ x, y }, pointIndex) => `${pointIndex === 0 ? "M" : "L"}${x},${y}`).join(" ");
        return (
          <g key={index}>
            <path
              d={`${line} L${points[points.length - 1].x},38 L${points[0].x},38 Z`}
              className="fill-current opacity-20"
            />
            <path d={line} className="fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            {points.length === 1 && <circle cx={points[0].x} cy={points[0].y} r={2} className="fill-current" />}
          </g>
        );
      })}
    </svg>
  );
}
