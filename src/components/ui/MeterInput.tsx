interface MeterInputProps {
  value: number | '';
  onChange: (value: number) => void;
  label?: string;
}

export function MeterInput({ value, onChange, label }: MeterInputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">{label}</label>
      )}
      <div className="flex items-center bg-elevated border border-border rounded-xl px-4 py-3 gap-2 focus-within:border-amber-primary transition-colors duration-150">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            if (raw === '') return;
            onChange(Number(raw));
          }}
          className="flex-1 bg-transparent text-xl font-medium text-text-primary outline-none min-w-0 placeholder:text-text-muted"
          placeholder="0"
        />
        <span className="text-sm font-medium text-text-muted flex-shrink-0">hrs</span>
      </div>
    </div>
  );
}
