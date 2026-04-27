/**
 * Switch that toggles the page between light mode and dark mode.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.isDarkMode - True when dark mode is active.
 * @param {Function} props.onToggle - Function called when the user changes the switch.
 * @returns {JSX.Element} A light/dark mode switch.
 */
export default function ThemeSwitch({ isDarkMode, onToggle }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-full bg-white px-4 py-3 ml-40 text-sm font-bold text-slate-700 shadow-lg shadow-slate-200/70 dark:bg-[#2b2b2b] dark:text-neutral-100 dark:shadow-black/30">
      <span>☀️ Light</span>

      <input
        type="checkbox"
        checked={isDarkMode}
        onChange={onToggle}
        className="sr-only"
        aria-label="Toggle dark mode"
      />

      {/* Visual switch track. */}
      <span className="relative h-7 w-12 rounded-full bg-slate-300 transition dark:bg-blue-600">
        {/* Visual switch knob. */}
        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform dark:translate-x-5" />
      </span>

      <span>Dark 🌙</span>
    </label>
  );
}
