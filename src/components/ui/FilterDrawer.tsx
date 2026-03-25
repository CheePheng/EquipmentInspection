import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface FilterSection {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sections: FilterSection[];
  values: Record<string, string[]>;
  onChange: (values: Record<string, string[]>) => void;
}

export function FilterDrawer({
  isOpen,
  onClose,
  title,
  sections,
  values,
  onChange,
}: FilterDrawerProps) {
  const toggleOption = (sectionKey: string, optionValue: string) => {
    const current = values[sectionKey] ?? [];
    const updated = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    onChange({ ...values, [sectionKey]: updated });
  };

  const clearAll = () => {
    const cleared: Record<string, string[]> = {};
    sections.forEach((s) => {
      cleared[s.key] = [];
    });
    onChange(cleared);
  };

  const hasAnySelection = sections.some((s) => (values[s.key] ?? []).length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            className="fixed bottom-0 left-0 right-0 z-50 bg-slate-dark rounded-t-2xl border-t border-border max-h-[80vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close filter drawer"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-elevated transition-colors duration-150"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drag handle */}
            <div className="flex justify-center pb-2 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
              {sections.map((section) => {
                const selected = values[section.key] ?? [];
                return (
                  <div key={section.key}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                      {section.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {section.options.map((opt) => {
                        const active = selected.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleOption(section.key, opt.value)}
                            className={[
                              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 min-h-[36px]',
                              active
                                ? 'bg-amber-primary text-obsidian'
                                : 'bg-elevated text-text-secondary hover:bg-border',
                            ].join(' ')}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 px-4 py-4 border-t border-border flex-shrink-0">
              <button
                type="button"
                onClick={clearAll}
                disabled={!hasAnySelection}
                className="flex-1 h-11 rounded-xl bg-elevated text-text-secondary text-sm font-medium hover:bg-border transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl bg-amber-primary text-obsidian text-sm font-semibold hover:bg-amber-hover active:bg-amber-pressed transition-colors duration-150"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
