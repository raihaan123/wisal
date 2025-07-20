import React from 'react'

interface OliveBranchProps {
  className?: string
  style?: React.CSSProperties
}

export function OliveBranch({ className = '', style = {} }: OliveBranchProps) {
  return (
    <svg
      viewBox="0 0 200 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Main stem */}
      <path
        d="M100 290 Q95 200 90 100 Q88 50 85 10"
        stroke="#63693B"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Leaves and olives */}
      {[
        { x: 70, y: 40, rotate: -30 },
        { x: 110, y: 60, rotate: 30 },
        { x: 65, y: 80, rotate: -35 },
        { x: 115, y: 100, rotate: 35 },
        { x: 60, y: 120, rotate: -40 },
        { x: 120, y: 140, rotate: 40 },
        { x: 55, y: 160, rotate: -45 },
        { x: 125, y: 180, rotate: 45 },
        { x: 50, y: 200, rotate: -50 },
        { x: 130, y: 220, rotate: 50 },
      ].map((leaf, index) => (
        <g key={index} transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rotate})`}>
          {/* Leaf */}
          <ellipse
            cx="0"
            cy="0"
            rx="20"
            ry="10"
            fill="#8A9D48"
            opacity="0.9"
          />
          {/* Olive */}
          {index % 3 === 0 && (
            <circle
              cx="15"
              cy="0"
              r="6"
              fill="#607B23"
              opacity="0.8"
            />
          )}
        </g>
      ))}
    </svg>
  )
}