interface SegmentOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <div
      role="radiogroup"
      className="bg-elevated rounded-xl p-1 flex gap-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={[
              'flex-1 rounded-lg min-h-[48px] flex items-center justify-center text-sm transition-all duration-150 select-none',
              active
                ? 'bg-amber-primary text-obsidian font-medium shadow-sm'
                : 'bg-transparent text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
