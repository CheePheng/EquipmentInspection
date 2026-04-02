import { useState, useMemo } from 'react';
import { Plus, Pencil, Truck } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { useTranslation } from '../../i18n/useTranslation';
import { useCollectionQuery } from '../../db/useFirestoreQuery';
import { machinesRef, sitesRef, query } from '../../db/collections';
import { addDocument, updateDocument } from '../../db/firestore';
import { MACHINE_TYPES, MACHINE_TYPE_LABELS } from '../../lib/constants';

interface MachineForm {
  code: string;
  name: string;
  type: string;
  siteId: string;
  status: 'active' | 'inactive';
}

const emptyForm: MachineForm = {
  code: '',
  name: '',
  type: '',
  siteId: '',
  status: 'active',
};

export default function FleetPage() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MachineForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const machinesQ = useMemo(() => query(machinesRef()), []);
  const machines = useCollectionQuery<any>(machinesQ, []);
  const sitesQ = useMemo(() => query(sitesRef()), []);
  const sites = useCollectionQuery<any>(sitesQ, []);

  const siteName = (siteId: number | string) =>
    sites?.find((s: any) => s.id === Number(siteId))?.name ?? '—';

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(machine: any) {
    setEditingId(machine.id);
    setForm({
      code: machine.code ?? '',
      name: machine.name ?? '',
      type: machine.type ?? '',
      siteId: machine.siteId != null ? String(machine.siteId) : '',
      status: machine.status ?? 'active',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId != null) {
        await updateDocument('machines', editingId, {
          code: form.code,
          name: form.name,
          type: form.type,
          siteId: form.siteId ? Number(form.siteId) : null,
          status: form.status,
        });
      } else {
        await addDocument('machines', {
          code: form.code,
          name: form.name,
          type: form.type,
          siteId: form.siteId ? Number(form.siteId) : null,
          status: 'active',
          availabilityState: 'available',
          currentMeterHours: 0,
          assignedOperatorId: null,
        });
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-primary transition-colors';

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-obsidian pb-24">
        <PageHeader
          title={t('page.fleet')}
          action={
            <Button variant="primary" size="sm" onClick={openAdd}>
              <Plus size={16} className="mr-1" />
              {t('action.addMachine')}
            </Button>
          }
        />

        <div className="px-4 py-4 space-y-3">
          {machines === undefined ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : machines.length === 0 ? (
            <EmptyState
              icon={Truck}
              title={t('empty.machines.title')}
              description={t('empty.machines.description')}
            />
          ) : (
            machines.map((m: any) => (
              <Card key={m.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-amber-primary">
                        {m.code}
                      </span>
                      <span className="text-text-primary font-medium truncate">
                        {m.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="default">
                        {MACHINE_TYPE_LABELS[m.type as keyof typeof MACHINE_TYPE_LABELS] ?? m.type}
                      </Badge>
                      <span className="text-xs text-text-secondary">
                        {siteName(m.siteId)}
                      </span>
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          m.status === 'active' ? 'bg-emerald-400' : 'bg-gray-500'
                        }`}
                      />
                      <span className="text-xs text-text-muted">
                        {m.status === 'active' ? t('status.active') : t('status.inactive')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(m)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId != null ? t('action.editMachine') : t('action.addMachine')}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1 block">
                {t('field.code')}
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder={t('field.code')}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1 block">
                {t('field.name')}
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder={t('field.name')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1 block">
                {t('field.type')}
              </label>
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="">{t('field.selectType')}</option>
                {MACHINE_TYPES.map((mt) => (
                  <option key={mt} value={mt}>
                    {MACHINE_TYPE_LABELS[mt]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1 block">
                {t('field.site')}
              </label>
              <select
                className={inputClass}
                value={form.siteId}
                onChange={(e) => setForm({ ...form, siteId: e.target.value })}
              >
                <option value="">{t('field.selectSite')}</option>
                {sites?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1 block">
                {t('field.status')}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: 'active' })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.status === 'active'
                      ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700'
                      : 'bg-elevated text-text-muted border border-border'
                  }`}
                >
                  {t('status.active')}
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: 'inactive' })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.status === 'inactive'
                      ? 'bg-red-900/40 text-red-300 border border-red-700'
                      : 'bg-elevated text-text-muted border border-border'
                  }`}
                >
                  {t('status.inactive')}
                </button>
              </div>
            </div>
            <Button
              variant="primary"
              fullWidth
              loading={saving}
              disabled={!form.code || !form.name || !form.type}
              onClick={handleSave}
            >
              {editingId != null ? t('action.save') : t('action.addMachine')}
            </Button>
          </div>
        </Modal>
      </div>
    </AnimatedPage>
  );
}
