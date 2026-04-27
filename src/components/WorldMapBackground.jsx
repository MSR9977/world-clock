import { useMemo, useRef } from "react";
import { motion } from "motion/react";
import DottedMap from "dotted-map";

const worldConnections = [
  {
    start: { lat: 64.2008, lng: -149.4937 },
    end: { lat: 34.0522, lng: -118.2437 },
  },
  {
    start: { lat: 64.2008, lng: -149.4937 },
    end: { lat: -15.7975, lng: -47.8919 },
  },
  {
    start: { lat: -15.7975, lng: -47.8919 },
    end: { lat: 38.7223, lng: -9.1393 },
  },
  {
    start: { lat: 51.5074, lng: -0.1278 },
    end: { lat: 28.6139, lng: 77.209 },
  },
  {
    start: { lat: 28.6139, lng: 77.209 },
    end: { lat: 43.1332, lng: 131.9113 },
  },
  {
    start: { lat: 28.6139, lng: 77.209 },
    end: { lat: -1.2921, lng: 36.8219 },
  },
];

function projectPoint(lat, lng) {
  const x = (lng + 180) * (800 / 360);
  const y = (90 - lat) * (400 / 180);

  return { x, y };
}

function createCurvedPath(start, end) {
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - 50;

  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
}

export default function WorldMapBackground({ isDarkMode }) {
  const svgRef = useRef(null);
  const lineColor = isDarkMode ? "#0ea5e9" : "#0284c7";
  const svgMap = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });

    return map.getSVG({
      radius: 0.22,
      color: isDarkMode ? "#ffffff38" : "#00000030",
      shape: "circle",
      backgroundColor: isDarkMode ? "#000000" : "#ffffff",
    });
  }, [isDarkMode]);

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-24 z-0 aspect-[2/1] w-full max-w-none -translate-x-1/2 select-none opacity-70 dark:opacity-60"
      aria-hidden="true"
    >
      <img
        className="h-full w-full object-contain [mask-image:linear-gradient(to_bottom,transparent,white_8%,white_86%,transparent)]"
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        alt=""
        draggable="false"
      />

      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="world-map-path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0" />
            <stop offset="8%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="92%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {worldConnections.map((connection, index) => {
          const startPoint = projectPoint(
            connection.start.lat,
            connection.start.lng
          );
          const endPoint = projectPoint(connection.end.lat, connection.end.lng);

          return (
            <motion.path
              d={createCurvedPath(startPoint, endPoint)}
              fill="none"
              key={`world-map-path-${index}`}
              stroke="url(#world-map-path-gradient)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.4,
                delay: 0.35 * index,
                ease: "easeOut",
              }}
            />
          );
        })}

        {worldConnections.map((connection, index) => (
          <g key={`world-map-points-${index}`}>
            {[connection.start, connection.end].map((point, pointIndex) => {
              const projectedPoint = projectPoint(point.lat, point.lng);

              return (
                <g key={`world-map-point-${index}-${pointIndex}`}>
                  <circle
                    cx={projectedPoint.x}
                    cy={projectedPoint.y}
                    r="2"
                    fill={lineColor}
                  />
                  <circle
                    cx={projectedPoint.x}
                    cy={projectedPoint.y}
                    r="2"
                    fill={lineColor}
                    opacity="0.45"
                  >
                    <animate
                      attributeName="r"
                      from="2"
                      to="8"
                      dur="1.8s"
                      begin={`${index * 0.18}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.45"
                      to="0"
                      dur="1.8s"
                      begin={`${index * 0.18}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}
