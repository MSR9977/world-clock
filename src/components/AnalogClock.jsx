/**
 * Displays an analog clock face with hour, minute, and second hands.
 *
 * @param {Object} props - Component props.
 * @param {Date} props.date - Current Date object used to calculate hand rotation.
 * @param {string} props.timeZone - IANA timezone name, for example "Asia/Bahrain".
 * @returns {JSX.Element} A theme-aware analog clock.
 */
export default function AnalogClock({ date, timeZone }) {
  // Extract the hour, minute, and second for the selected timezone.
  const timeParts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  /**
   * Read a numeric value from Intl.DateTimeFormat parts.
   *
   * @param {string} type - Part type, such as "hour", "minute", or "second".
   * @returns {number} Numeric value for the requested time part.
   */
  function getPart(type) {
    return Number(timeParts.find((part) => part.type === type)?.value ?? 0);
  }

  const hours = getPart("hour") % 12;
  const minutes = getPart("minute");
  const seconds = getPart("second");

  // Convert time values into degrees for CSS rotation.
  const hourRotation = hours * 30 + minutes * 0.5;
  const minuteRotation = minutes * 6 + seconds * 0.1;
  const secondRotation = seconds * 6;

  return (
    <div
      className="relative h-[5.5rem] w-[5.5rem] shrink-0 rounded-full border-4 border-slate-300 bg-white shadow-inner transition-colors dark:border-neutral-600 dark:bg-[#2a2a2a] sm:h-24 sm:w-24 xl:h-28 xl:w-28"
      aria-label={`Analog clock for ${timeZone}`}
    >
      {/* Hour markers around the clock face. */}
      {Array.from({ length: 12 }).map((_, index) => {
        const markerRotation = index * 30;
        const markerAngle = (markerRotation - 90) * (Math.PI / 180);
        const markerRadius = 42;
        const markerLeft = 50 + Math.cos(markerAngle) * markerRadius;
        const markerTop = 50 + Math.sin(markerAngle) * markerRadius;
        const isQuarterMarker = index % 3 === 0;

        return (
          <span
            // The index is stable here because the markers are a fixed visual list.
            key={index}
            className={`absolute rounded-full bg-slate-400 dark:bg-neutral-300 ${
              isQuarterMarker ? "h-2.5 w-0.5" : "h-1.5 w-px"
            }`}
            style={{
              left: `${markerLeft}%`,
              top: `${markerTop}%`,
              transform: `translate(-50%, -50%) rotate(${markerRotation}deg)`,
            }}
          />
        );
      })}

      {/* Hour hand. */}
      <span
        className="absolute left-1/2 top-1/2 h-7 w-1 origin-bottom rounded-full bg-slate-900 transition-colors dark:bg-white sm:h-8"
        style={{ transform: `translate(-50%, -100%) rotate(${hourRotation}deg)` }}
      />

      {/* Minute hand. */}
      <span
        className="absolute left-1/2 top-1/2 h-9 w-0.5 origin-bottom rounded-full bg-blue-600 transition-colors dark:bg-blue-300 sm:h-11"
        style={{ transform: `translate(-50%, -100%) rotate(${minuteRotation}deg)` }}
      />

      {/* Second hand. */}
      <span
        className="absolute left-1/2 top-1/2 h-10 w-px origin-bottom rounded-full bg-red-500 transition-colors dark:bg-red-300 sm:h-12"
        style={{ transform: `translate(-50%, -100%) rotate(${secondRotation}deg)` }}
      />

      {/* Center cap. */}
      <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900 ring-4 ring-white transition-colors dark:bg-white dark:ring-[#2a2a2a]" />
    </div>
  );
}
