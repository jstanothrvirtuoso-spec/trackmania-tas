
import { useEffect, useMemo, useRef, useState } from "react";

export function DropSelect<T extends string>({ initialValue, defaultOption, options, onChange, fullWidth=false }: {
  initialValue: T;
  options: { value: T; label: string }[];
  defaultOption?: { value: T; label: string };
  onChange?: (value: T) => void;
  fullWidth?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const scrollTopRef = useRef(0);
  const allOptions = defaultOption ? [defaultOption, ...options] : options;

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [buttonWidth, setButtonWidth] = useState<number | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (measureRef.current) {
      const width = Array.from(measureRef.current.children).reduce(
        (max, child) => Math.max(max, (child as HTMLElement).getBoundingClientRect().width),
        0,
      );
      setButtonWidth(Math.min(Math.ceil(width + 62), window.innerWidth - 32));
    }
  }, [allOptions]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = scrollTopRef.current;
    }
  }, [open]);

  const optionsSignature = useMemo(() => {
    return [
      defaultOption ? `${defaultOption.value}:${defaultOption.label}` : "",
      ...options.map((option) => `${option.value}:${option.label}`),
    ].join("|");
  }, [defaultOption, options]);

  useEffect(() => {
    scrollTopRef.current = 0;
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [optionsSignature]);

  return (
    <div
      ref={ref}
      className={`relative inline-block text-left${fullWidth ? " w-full" : ""}`}
      style={ fullWidth ? undefined : buttonWidth ? { width: `${buttonWidth}px` } : { minWidth: 170 } }
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          const key = event.key;
          if (key.length === 1 && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
            const searchChar = key.toLowerCase();
            const startIndex = Math.max(0, allOptions.findIndex((option) => option.value === value)) + 1;
            const nextOption = Array.from({ length: allOptions.length }, (_, i) => allOptions[(startIndex + i) % allOptions.length]).find(
              (option) => option.label.trim().charAt(0).toLowerCase() === searchChar,
            );

            if (nextOption) {
              setValue(nextOption.value);
              onChange?.(nextOption.value);
              event.preventDefault();
            }
          }
        }}
        className="
          relative inline-flex w-full items-center justify-between rounded-lg 
          border border-slate-700 bg-slate-800 px-3 py-1.5 pr-10 text-left text-slate-100 
          shadow-sm transition hover:bg-slate-700 cursor-pointer text-xs sm:text-sm"
        type="button"
      >
        <span className="truncate">
          {allOptions.find((option) => option.value === value)?.label ?? defaultOption?.label ?? initialValue}
        </span>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center">
          <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current text-slate-100">
            <path d="M10 14l5-5H5l5 5z" />
          </svg>
        </span>
      </button>

      <div
        ref={measureRef}
        className="pointer-events-none absolute left-0 top-0 opacity-0 whitespace-nowrap"
        style={{ width: 0, height: 0, overflow: "hidden" }}
      >
        {allOptions.map((option) => (
          <span key={option.value} className="inline-block px-2 py-1 font-sans text-sm sm:text-md">
            {option.label}
          </span>
        ))}
      </div>

      {open && (
        <div
          ref={listRef}
          className="absolute left-0 z-20 mt-0.5 w-full max-h-120 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/95 p-1 shadow-2xl backdrop-blur-sm text-sm sm:text-md"
          onScroll={(event) => {
            scrollTopRef.current = (event.target as HTMLDivElement).scrollTop;
          }}
        >
          {allOptions.map((option, index) => {
            const isSelected = option.value === value;
            const isDefault = defaultOption && option.value === defaultOption.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setValue(option.value);
                  onChange?.(option.value);
                  setOpen(false);
                }}
                className={`w-full rounded-md px-2 py-1 text-left transition cursor-pointer ${
                  isSelected
                    ? "bg-sky-800"
                    : index % 2 === 0
                      ? "bg-slate-900"
                      : "bg-slate-800"
                } ${
                  isDefault
                    ? "text-emerald-300 italic font-semibold"
                    : isSelected
                      ? "text-amber-300 font-semibold italic"
                      : "text-slate-100"
                } hover:bg-emerald-700/80`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
