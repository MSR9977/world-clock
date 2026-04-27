/**
 * Button that toggles the clock display between 12-hour and 24-hour time.
 *
 * @param {Object} props - Component props.
 * @param {"12" | "24"} props.timeFormat - Current selected time format.
 * @param {Function} props.onToggle - Function called when the user clicks the button.
 * @returns {JSX.Element} A time format toggle button.
 */
export default function ToggleTimeFormatButton({ timeFormat, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white mr-40 shadow-sm shadow-blue-800/30 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-800 dark:bg-blue-500 dark:hover:bg-blue-800 dark:focus:ring-blue-800"
    >
      {/* The text explains what format is currently active and what locale style it represents. */}
      Time Format: {timeFormat === "24" ? "24-hour / GB" : "12-hour / US"}
    </button>
  );
}
