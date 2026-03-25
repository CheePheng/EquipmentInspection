import { useNavigate } from 'react-router-dom';
import { SegmentedControl } from '../../components/ui/SegmentedControl';

interface ChecklistItemData {
  id: string;
  label: string;
  category: string;
  required: boolean;
}

interface ChecklistItemValue {
  result: string;
  notes: string;
}

interface ChecklistItemProps {
  item: ChecklistItemData;
  value: ChecklistItemValue;
  onChange: (value: ChecklistItemValue) => void;
  machineId: number;
  inspectionId?: number;
}

const RESULT_OPTIONS = [
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
  { value: 'na', label: 'N/A' },
];

const CATEGORY_LABELS: Record<string, string> = {
  engine: 'Engine',
  hydraulic: 'Hydraulic',
  electrical: 'Electrical',
  structural: 'Structural',
  safety: 'Safety',
  'tires-tracks': 'Tyres/Tracks',
  'cab-controls': 'Cab/Controls',
  'lights-signals': 'Lights/Signals',
  'fluid-leaks': 'Fluid Leaks',
  other: 'Other',
};

function resultBorderClass(result: string): string {
  if (result === 'pass') return 'border-emerald-700/60';
  if (result === 'fail') return 'border-red-700/60';
  return 'border-border';
}

function resultBgClass(result: string): string {
  if (result === 'pass') return 'bg-emerald-900/20';
  if (result === 'fail') return 'bg-red-900/20';
  return 'bg-surface';
}

export function ChecklistItem({ item, value, onChange, machineId, inspectionId }: ChecklistItemProps) {
  const navigate = useNavigate();
  const isFail = value.result === 'fail';

  function handleResultChange(result: string) {
    onChange({
      result,
      notes: result !== 'fail' ? '' : value.notes,
    });
  }

  function handleNotesChange(notes: string) {
    onChange({ ...value, notes });
  }

  function handleReportDefect() {
    const params = new URLSearchParams({ machineId: String(machineId) });
    if (inspectionId !== undefined) params.set('inspectionId', String(inspectionId));
    navigate(`/defects/new?${params.toString()}`);
  }

  return (
    <div
      className={[
        'rounded-xl border p-4 space-y-3 transition-colors duration-150',
        resultBorderClass(value.result),
        resultBgClass(value.result),
      ].join(' ')}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-text-primary leading-snug">{item.label}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {CATEGORY_LABELS[item.category] ?? item.category}
            {item.required && <span className="text-amber-primary ml-1">*</span>}
          </p>
        </div>
      </div>

      {/* Pass / Fail / N/A control */}
      <SegmentedControl
        options={RESULT_OPTIONS}
        value={value.result}
        onChange={handleResultChange}
      />

      {/* Notes textarea — only shown on Fail */}
      {isFail && (
        <div className="space-y-2">
          <textarea
            value={value.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Describe the fault… (optional)"
            rows={2}
            className="w-full bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted resize-none outline-none focus:border-amber-primary transition-colors duration-150"
          />
          <button
            type="button"
            onClick={handleReportDefect}
            className="text-sm text-amber-primary hover:text-amber-hover underline underline-offset-2 transition-colors duration-150"
          >
            Report defect →
          </button>
        </div>
      )}
    </div>
  );
}
