import React from "react";

function DonutChart({ easy = 0, medium = 0, hard = 0, extraSegments = [] }) {
  const segments = [
    ...extraSegments,
    { count: easy, color: "#22c55e" },
    { count: medium, color: "#f89f1b" },
    { count: hard, color: "#ef4444" },
  ];
  const total = segments.reduce((sum, { count }) => sum + count, 0);
  const r = 42;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width="110" height="110" viewBox="0 0 110 110" className="shrink-0">
      <circle
        cx="55"
        cy="55"
        r={r}
        fill="none"
        stroke="#2e2e2e"
        strokeWidth="10"
      />

      {segments.map(({ count, color }) => {
        if (!count) return null;
        const dash = (count / total) * circ;
        const dashOffset = offset;
        offset -= dash;
        return (
          <circle
            key={color}
            cx="55"
            cy="55"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 55 55)"
          />
        );
      })}

      <text
        x="55"
        y="51"
        textAnchor="middle"
        fill="white"
        fontSize="18"
        fontWeight="bold"
      >
        {total}
      </text>
      <text x="55" y="65" textAnchor="middle" fill="#71717a" fontSize="9">
        Solved
      </text>
    </svg>
  );
}

export default DonutChart;
