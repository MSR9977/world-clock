import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Dropdown card for adding a new country clock from local timezone data.
 *
 * @param {Object} props - Component props.
 * @param {{id: number, name: string, flag: string, capital: string, timezone: string}[]} props.countries - Country timezone options.
 * @param {Set<string>} props.selectedTimeZones - Timezones already shown in the clock list.
 * @param {(country: {name: string, flag: string, capital: string, timezone: string}) => void} props.onAddCountry - Adds the chosen country clock.
 * @returns {JSX.Element} A responsive dropdown control.
 */
export default function AddMoreCountries({
  countries,
  selectedTimeZones,
  onAddCountry,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const availableCountries = useMemo(
    () =>
      countries.filter((country) => !selectedTimeZones.has(country.timezone)),
    [countries, selectedTimeZones]
  );
  const filteredCountries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return availableCountries;
    }

    return availableCountries.filter((country) => {
      const searchableText = `${country.name} ${country.capital} ${country.timezone}`.toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [availableCountries, searchQuery]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleSelectCountry(country) {
    onAddCountry(country);
    setSearchQuery("");
    setIsOpen(false);
  }

  function handleSearchChange(event) {
    setSearchQuery(event.target.value);
    setIsOpen(true);
  }

  return (
    <div className="relative z-50 mx-auto mt-15 flex w-full max-w-xl flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg shadow-slate-200/60 backdrop-blur transition-colors dark:border-neutral-700 dark:bg-[#1f1f1f]/90 dark:shadow-black/30 sm:flex-row sm:items-center">
      <label className="text-sm font-bold leading-none text-slate-800 dark:text-white">
        Add Clock
      </label>

      <div className="relative min-w-0 flex-1" ref={dropdownRef}>
        <div
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 outline-none transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15 dark:border-neutral-700 dark:bg-[#171717] dark:text-neutral-100"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <input
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            type="text"
            value={searchQuery}
            placeholder="Type country name"
            aria-label="Type country name"
            autoComplete="off"
            onChange={handleSearchChange}
            onFocus={() => setIsOpen(true)}
          />
          <button
            className="text-slate-400 transition hover:text-blue-500 focus:outline-none focus:text-blue-500"
            type="button"
            aria-label="Open country dropdown"
            onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
          >
            ➕
          </button>
        </div>

        {isOpen && (
          <div
            className="absolute left-0 top-full z-[9999] mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-2xl shadow-slate-900/20 dark:border-neutral-700 dark:bg-[#1f1f1f]"
            role="listbox"
          >
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-blue-50 focus:bg-blue-50 focus:outline-none dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                  key={`${country.id}-${country.timezone}`}
                  type="button"
                  role="option"
                  onClick={() => handleSelectCountry(country)}
                >
                  <span className="inline-flex items-center gap-2">
                    <img
                      className="h-3.5 w-5 rounded-sm object-cover"
                      src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                      alt=""
                      loading="lazy"
                    />
                    <span>
                      {country.capital}, {country.name}
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                No countries found
              </p>
            )}
          </div>
        )}

        <select
          className="sr-only"
          defaultValue=""
          tabIndex={-1}
          aria-hidden="true"
        >
          <option value="" disabled>
          Choose country
          </option>

          {countries.map((country) => (
            <option value={country.timezone} key={`${country.id}-${country.timezone}`}>
              {country.flag} {country.capital}, {country.name}
            </option>
          ))}
        </select>
      </div>

      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Capital city timezone
      </span>
    </div>
  );
}
