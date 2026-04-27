import AnalogClock from "./AnalogClock.jsx";

/**
 * Displays a live digital and analog clock for one timezone.
 *
 * @param {Object} props - Component props.
 * @param {Date} props.date - Shared current Date object used by all clocks.
 * @param {string} props.timeZone - IANA timezone name, for example "Asia/Bahrain".
 * @param {"12" | "24"} props.timeFormat - Controls whether the digital time uses 12-hour or 24-hour format.
 * @returns {JSX.Element} A formatted clock for the selected timezone.
 */
export default function Clock({ date, timeZone, timeFormat }) {
  // Format ONLY the digital time. The 12-hour mode keeps a lowercase am/pm suffix.
  const timeFormatter = new Intl.DateTimeFormat(
    timeFormat === "24" ? "en-GB" : "en-US",
    {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: timeFormat === "12",
    }
  );

  const formattedTime =
    timeFormat === "12"
      ? timeFormatter
          .formatToParts(date)
          .map((part) =>
            part.type === "dayPeriod" ? part.value.toLowerCase() : part.value
          )
          .join("")
      : timeFormatter.format(date);

  // Keep the date separate so the 12/24 toggle affects the time only.
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);

  return (
    <div className="flex flex-col items-start gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
      <div className="flex flex-col gap-1">
        {/* Render the live digital time for this timezone only. */}
        <strong className="text-2xl font-bold tracking-wide text-blue-600 dark:text-blue-300 lg:text-3xl">
          {formattedTime}
        </strong>

        {/* Render the date for context. */}
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {formattedDate}
        </span>
      </div>

      {/* Render a theme-aware analog clock beside the digital time. */}
      <AnalogClock date={date} timeZone={timeZone} />
    </div>
  );
}
