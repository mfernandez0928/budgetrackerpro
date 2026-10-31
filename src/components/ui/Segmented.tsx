import { useRef, type KeyboardEvent } from "react";

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
  ariaLabel: string;
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = "md",
  ariaLabel,
}: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  const itemSize = size === "sm" ? "min-h-[36px] px-3 text-xs" : "min-h-[44px] px-4 text-sm";

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex rounded-full bg-raised p-1">
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`rounded-full font-semibold transition ${itemSize} ${
              selected ? "bg-brand text-on-brand" : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
