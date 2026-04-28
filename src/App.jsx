import { useEffect, useMemo, useState } from "react";
import "./App.css";
import AddMoreCountries from "./components/AddMoreCountries.jsx";
import ThemeSwitch from "./components/ThemeSwitch.jsx";
import ToggleTimeFormatButton from "./components/ToggleTimeFormatButton.jsx";
import WorldClock from "./components/WorldClock.jsx";
import WorldMapBackground from "./components/WorldMapBackground.jsx";

const SAVED_CLOCKS_KEY = "world-clock-selected-clocks";
const SAVED_THEME_KEY = "world-clock-is-dark-mode";

const defaultClockData = [
  { city: "Manama, Bahrain", countryCode: "BH", timeZone: "Asia/Bahrain" },
  { city: "London", countryCode: "GB", timeZone: "Europe/London" },
  { city: "New York", countryCode: "US", timeZone: "America/New_York" },
  { city: "Tokyo", countryCode: "JP", timeZone: "Asia/Tokyo" },
];

function getSavedClockData() {
  const savedClockData = localStorage.getItem(SAVED_CLOCKS_KEY);

  if (!savedClockData) {
    return defaultClockData;
  }

  try {
    const parsedClockData = JSON.parse(savedClockData);

    if (
      Array.isArray(parsedClockData) &&
      parsedClockData.every((clock) => clock.city && clock.timeZone)
    ) {
      return parsedClockData;
    }
  } catch (error) {
    console.error("Unable to read saved clocks:", error);
  }

  return defaultClockData;
}

/**
 * Root application component.
 *
 * Purpose:
 * - Stores the city/timezone data.
 * - Stores the selected 12-hour or 24-hour time format.
 * - Stores the selected light or dark theme.
 * - Passes data down to child components using props.
 *
 * @returns {JSX.Element} The complete World Clock application UI.
 */
export default function App() {
  // Store the active time format. "24" uses GB style; "12" uses US style.
  const [timeFormat, setTimeFormat] = useState("24");
  const [isClearToastOpen, setIsClearToastOpen] = useState(false);

  // Store the active theme mode for the app wrapper.
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(SAVED_THEME_KEY);

    return savedTheme ? JSON.parse(savedTheme) : true;
  });

  // Store the visible clocks. Each object has a city label and an IANA timezone string.
  const [clockData, setClockData] = useState(getSavedClockData);

  // Store countries loaded from the local public JSON file.
  const [countries, setCountries] = useState([]);

  const selectedTimeZones = useMemo(
    () => new Set(clockData.map((clock) => clock.timeZone)),
    [clockData]
  );

  useEffect(() => {
    fetch("/timezones_and_flags.json")
      .then((response) => response.json())
      .then((countryData) => {
        setCountries(
          countryData
            .filter((country) => country.capital && country.timezone)
            .sort((firstCountry, secondCountry) =>
              firstCountry.name.localeCompare(secondCountry.name)
            )
        );
      })
      .catch((error) => {
        console.error("Unable to load local timezone data:", error);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem(SAVED_CLOCKS_KEY, JSON.stringify(clockData));
  }, [clockData]);

  useEffect(() => {
    localStorage.setItem(SAVED_THEME_KEY, JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  /**
   * Add one country clock from the dropdown data.
   *
   * @param {{name: string, flag: string, capital: string, timezone: string}} country - Selected country.
   * @returns {void}
   */
  function handleAddCountry(country) {
    setClockData((currentClocks) => {
      if (currentClocks.some((clock) => clock.timeZone === country.timezone)) {
        return currentClocks;
      }

      return [
        ...currentClocks,
        {
          city: `${country.capital}, ${country.name}`,
          countryCode: country.code,
          timeZone: country.timezone,
        },
      ];
    });
  }

  /**
   * Reorder clock cards after drag and drop.
   *
   * @param {number} fromIndex - Current dragged card index.
   * @param {number} toIndex - Target card index.
   * @returns {void}
   */
  function handleReorderClocks(fromIndex, toIndex) {
    setClockData((currentClocks) => {
      if (fromIndex === toIndex) {
        return currentClocks;
      }

      const reorderedClocks = [...currentClocks];
      const [movedClock] = reorderedClocks.splice(fromIndex, 1);
      reorderedClocks.splice(toIndex, 0, movedClock);

      return reorderedClocks;
    });
  }

  /**
   * Toggle time format between 24-hour GB style and 12-hour US style.
   *
   * @returns {void}
   */
  function handleToggleTimeFormat() {
    setTimeFormat((currentFormat) => (currentFormat === "24" ? "12" : "24"));
  }

  /**
   * Toggle the app theme between light mode and dark mode.
   *
   * @returns {void}
   */
  function handleToggleTheme() {
    setIsDarkMode((currentMode) => !currentMode);
  }

  function handleRequestClearClocks() {
    if (clockData.length > 0) {
      setIsClearToastOpen(true);
    }
  }

  function handleConfirmClearClocks() {
    setClockData([]);
    setIsClearToastOpen(false);
  }

  function handleRemoveClock(timeZone) {
    setClockData((currentClocks) =>
      currentClocks.filter((clock) => clock.timeZone !== timeZone)
    );
  }

  return (
    <main className={isDarkMode ? "dark" : ""}>
      <div className="relative overflow-hidden bg-white px-5 py-4 pb-3 text-slate-900 transition-colors dark:bg-[#121212] dark:text-white sm:py-5 sm:pb-4">
        <WorldMapBackground isDarkMode={isDarkMode} />

        <section className="relative z-10 mx-auto w-full max-w-[1800px]">
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-full w-full items-center justify-center sm:h-28">
              <img
                src={isDarkMode ? "/logo-dark.svg" : "/logo-light.svg"}
                alt="Clock"
                className="select-none"
                draggable="false"
                style={{ width: "min(68vw, 500px)", maxWidth: "100%", height: "auto", marginBottom: "0.25rem" }}
              />
            </div>
            <div className="absolute left-5 top-5 text-center text-sm font-bold text-slate-600 dark:text-slate-300">
                      <button
                className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 shadow-lg shadow-red-950/5 transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-500/15 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-red-900/60 dark:bg-[#2a1717] dark:text-red-200 dark:hover:bg-[#351b1b] dark:disabled:border-neutral-800 dark:disabled:bg-neutral-900 dark:disabled:text-neutral-600"
                type="button"
                disabled={clockData.length === 0}
                onClick={handleRequestClearClocks}
              >
                Clear Clocks
              </button>
              </div>

            <div className="mt-2 grid grid-cols-2 gap-3 sm:mt-3 sm:items-center">
              {/* User controls: one button for time format and one switch for the theme. */}
              <ToggleTimeFormatButton
                timeFormat={timeFormat}
                onToggle={handleToggleTimeFormat}
              />

              <ThemeSwitch
                isDarkMode={isDarkMode}
                onToggle={handleToggleTheme}
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 lg:flex-row lg:items-start lg:justify-center">
              <AddMoreCountries
                countries={countries}
                selectedTimeZones={selectedTimeZones}
                onAddCountry={handleAddCountry}
              />

      
            </div>

            <WorldClock
              clockData={clockData}
              timeFormat={timeFormat}
              onReorderClocks={handleReorderClocks}
              onRemoveClock={handleRemoveClock}
            />
          </div>
        </section>

        {isClearToastOpen && (
          <div
            className="fixed right-5 top-5 z-[10000] w-[calc(100%-2.5rem)] max-w-sm rounded-3xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl shadow-slate-950/20 dark:border-neutral-700 dark:bg-[#1f1f1f] dark:text-white"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-clocks-title"
          >
            <div className="space-y-4">
              <div>
                <h2
                  className="text-base font-bold"
                  id="clear-clocks-title"
                >
                  Clear all clocks?
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  This will remove every visible clock. You can add clocks again
                  from the country dropdown.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-500/10 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  type="button"
                  onClick={() => setIsClearToastOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:bg-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/25"
                  type="button"
                  onClick={handleConfirmClearClocks}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

<footer className="relative z-20 mx-auto mt-3 flex w-fit max-w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-medium text-slate-500 shadow-lg shadow-slate-950/5 backdrop-blur dark:border-neutral-100/15 dark:bg-black/20 dark:text-slate-400">
          <span>Made by Mohamed Alromaihi🔺</span>
          <a
            href="https://github.com/MSR9977/world-clock"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open world-clock repository on GitHub"
            className="rounded-full p-1 text-slate-700 transition hover:text-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:text-slate-300 dark:hover:text-blue-400"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.59 2 12.253c0 4.529 2.865 8.371 6.839 9.727.5.095.683-.222.683-.494 0-.244-.009-.89-.014-1.747-2.782.62-3.369-1.375-3.369-1.375-.455-1.185-1.11-1.5-1.11-1.5-.908-.636.069-.623.069-.623 1.004.072 1.532 1.057 1.532 1.057.892 1.565 2.341 1.113 2.91.851.091-.662.349-1.113.635-1.369-2.221-.259-4.556-1.139-4.556-5.067 0-1.119.39-2.034 1.03-2.751-.103-.259-.446-1.302.098-2.713 0 0 .84-.276 2.75 1.051A9.372 9.372 0 0 1 12 6.958a9.37 9.37 0 0 1 2.504.345c1.909-1.327 2.747-1.051 2.747-1.051.546 1.411.203 2.454.1 2.713.641.717 1.028 1.632 1.028 2.751 0 3.938-2.339 4.805-4.567 5.059.359.317.679.943.679 1.9 0 1.37-.013 2.475-.013 2.811 0 .274.18.594.688.493C19.138 20.62 22 16.78 22 12.253 22 6.59 17.523 2 12 2Z"
              />
            </svg>
          </a>
        </footer>
      </div>
    </main>
  );
}
