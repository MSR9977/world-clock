import { useEffect, useState } from "react";
import Clock from "./Clock.jsx";

const knownCityCountryCodes = {
  London: "GB",
  "Manama, Bahrain": "BH",
  "New York": "US",
  Tokyo: "JP",
};

function getCountryCodeFromFlagEmoji(city) {
  const firstTwoCharacters = Array.from(city).slice(0, 2);

  if (firstTwoCharacters.length !== 2) {
    return "";
  }

  const code = firstTwoCharacters
    .map((character) => character.codePointAt(0) - 127397)
    .map((charCode) => String.fromCharCode(charCode))
    .join("");

  return /^[A-Z]{2}$/.test(code) ? code : "";
}

function getCleanCityName(city) {
  return city.replace(/^\p{Regional_Indicator}{2}\s*/u, "");
}

function FlagIcon({ countryCode }) {
  if (!countryCode) {
    return null;
  }

  return (
    <img
      className="h-3.5 w-5 rounded-sm object-cover"
      src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
      alt=""
      loading="lazy"
    />
  );
}

/**
 * Renders a table-like list of clocks using reusable Clock components.
 *
 * @param {Object} props - Component props.
 * @param {{city: string, timeZone: string}[]} props.clockData - List of cities and timezones.
 * @param {"12" | "24"} props.timeFormat - Current time format selected by the user.
 * @param {(fromIndex: number, toIndex: number) => void} props.onReorderClocks - Reorders clocks after drag and drop.
 * @param {(timeZone: string) => void} props.onRemoveClock - Removes one clock from the list.
 * @returns {JSX.Element} A responsive world clock list.
 */
export default function WorldClock({
  clockData,
  timeFormat,
  onReorderClocks,
  onRemoveClock,
}) {
  // One shared timer keeps every clock in sync without creating one interval per city.
  const [date, setDate] = useState(new Date());
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [pendingRemoveTimeZone, setPendingRemoveTimeZone] = useState("");
  const [removingTimeZones, setRemovingTimeZones] = useState([]);

  useEffect(() => {
    const timerId = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (!pendingRemoveTimeZone) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!event.target.closest("[data-remove-clock-button]")) {
        setPendingRemoveTimeZone("");
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [pendingRemoveTimeZone]);

  if (clockData.length === 0) {
    return (
      <section
        className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center shadow-lg shadow-slate-200/40 dark:border-neutral-700 dark:bg-[#1f1f1f]/70 dark:shadow-black/30"
        aria-label="World clocks list"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          No clocks selected
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Add a country to show its live clock here.
        </p>
      </section>
    );
  }

  return (
    <section
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6"
      aria-label="World clocks list"
    >
      {/* Render clocks as cards in a responsive four-column grid. */}
      {clockData.map((clock, index) => {
        const isDragging = draggedIndex === index;
        const isDragTarget = dragOverIndex === index && draggedIndex !== index;
        const isRemovePending = pendingRemoveTimeZone === clock.timeZone;
        const cleanCityName = getCleanCityName(clock.city);
        const [capitalName, ...countryNameParts] = cleanCityName.split(",");
        const countryName = countryNameParts.join(",").trim();
        const countryCode =
          clock.countryCode ||
          getCountryCodeFromFlagEmoji(clock.city) ||
          knownCityCountryCodes[cleanCityName];

        const isRemoving = removingTimeZones.includes(clock.timeZone);

        return (
        <article
          className={`${isRemoving ? "animate-pop-out pointer-events-none" : "animate-pop-in"} min-h-[155px] cursor-move rounded-3xl border bg-white px-5 py-4 text-left shadow-xl shadow-slate-200/70 transition-all hover:bg-slate-50 active:cursor-grabbing dark:bg-[#1f1f1f] dark:shadow-black/30 dark:hover:bg-[#242424] xl:px-5 xl:py-4 ${
            isDragTarget
              ? "border-blue-500 ring-4 ring-blue-500/20 dark:border-blue-400 dark:ring-blue-400/20"
              : "border-slate-200 dark:border-neutral-700"
          } ${isDragging ? "scale-[0.98] opacity-50" : ""}`}
          draggable
          key={clock.timeZone}
          onDragEnd={() => {
            setDraggedIndex(null);
            setDragOverIndex(null);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOverIndex(index);
          }}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", String(index));
            setDraggedIndex(index);
          }}
          onDrop={(event) => {
            event.preventDefault();

            const sourceIndex = Number(event.dataTransfer.getData("text/plain"));

            if (!Number.isNaN(sourceIndex)) {
              onReorderClocks(sourceIndex, index);
            }

            setDraggedIndex(null);
            setDragOverIndex(null);
          }}
          title="Drag to reorder"
        >
          <div className="mb-2 flex justify-end">
            <button
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-base font-bold leading-none transition focus:outline-none focus:ring-4 focus:ring-red-500/15 ${
                isRemovePending
                  ? "border-red-500 bg-red-600 text-white shadow-lg shadow-red-950/20 hover:bg-red-500 dark:border-red-400 dark:bg-red-500 dark:hover:bg-red-400"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-neutral-700 dark:bg-[#171717] dark:text-neutral-400 dark:hover:border-red-900/60 dark:hover:bg-[#2a1717] dark:hover:text-red-200"
              }`}
              type="button"
              data-remove-clock-button
              aria-label={
                isRemovePending
                  ? `Confirm removing ${cleanCityName} clock`
                  : `Prepare to remove ${cleanCityName} clock`
              }
              draggable="false"
              onClick={(event) => {
                event.stopPropagation();

                if (isRemovePending) {
                  setRemovingTimeZones((prev) => [...prev, clock.timeZone]);
                  setPendingRemoveTimeZone("");
                  setTimeout(() => {
                    onRemoveClock(clock.timeZone);
                    setRemovingTimeZones((prev) =>
                      prev.filter((tz) => tz !== clock.timeZone)
                    );
                  }, 400);
                  return;
                }

                setPendingRemoveTimeZone(clock.timeZone);
              }}
            >
              {isRemovePending ? "X" : "-"}
            </button>
          </div>

          {/* City label. */}
          <div className="mb-3 flex min-w-0 items-start gap-2 leading-snug text-slate-900 dark:text-white">
            <FlagIcon countryCode={countryCode} />
            <span className="min-w-0 [overflow-wrap:anywhere]">
              <span className="block text-lg font-extrabold">{capitalName.trim()}</span>
              {countryName && (
                <span className="block text-sm font-bold text-slate-600 dark:text-neutral-300">
                  {countryName}
                </span>
              )}
            </span>
          </div>

          {/* Pass the timezone and selected time format to the reusable Clock component. */}
          <Clock
            date={date}
            timeZone={clock.timeZone}
            timeFormat={timeFormat}
          />
        </article>
        );
      })}
    </section>
  );
}
