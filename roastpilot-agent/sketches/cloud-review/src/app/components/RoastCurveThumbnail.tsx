export function RoastCurveThumbnail() {
  const points = [
    { x: 5, y: 85 },
    { x: 15, y: 80 },
    { x: 25, y: 70 },
    { x: 35, y: 55 },
    { x: 45, y: 42 },
    { x: 55, y: 32 },
    { x: 65, y: 25 },
    { x: 75, y: 20 },
    { x: 85, y: 18 },
    { x: 95, y: 15 },
  ];

  const pathData = points
    .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d97706" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathData} L 95 100 L 5 100 Z`}
        fill="url(#curveGradient)"
      />
      <path
        d={pathData}
        fill="none"
        stroke="#d97706"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
