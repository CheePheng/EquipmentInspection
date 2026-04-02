import { useState, useMemo } from 'react';
import { Plus, Pencil, Users } from 'lucide-react';
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
import { usersRef, sitesRef, query } from '../../db/collections';
import { addDocument, updateDocument } from '../../db/firestore';

interface UserForm {
  name: string;
  pin: string;
  role: 'worker' | 'supervisor';
  siteId: string;
}

const emptyForm: UserForm = {
  name: '',
  pin: '',
  role: 'worker',
  siteId: '',
};

export default function TeamPage() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const usersQ = useMemo(() => query(usersRef()), []);
  const users = useCollectionQuery<any>(usersQ, []);
  const sitesQ = useMemo(() => query(sitesRef()), []);
  const sites = useCollectionQuery<any>(sitesQ, []);

  const siteName = (siteId: number | string) =>
    sites?.find((s: any) => s.id === Number(siteId))?.name ?? '—';

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(user: any) {
    setEditingId(user.id);
    setForm({
      name: user.name ?? '',
      pin: user.pin ?? '',
      role: user.role === 'supervisor' ? 'supervisor' : 'worker',
      siteId: user.siteId != null ? String(user.siteId) : '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId != null) {
        await updateDocument('users', editingId, {
          name: form.name,
          pin: form.pin,
          role: form.role,
          siteId: form.siteId ? Number(form.siteId) : null,
        });
      } else {
        await addDocument('users', {
          name: form.name,
          pin: form.pin,
          role: form.role,
          siteId: form.siteId ? Number(form.siteId) : null,
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
          title={t('page.team')}
          action={
            <Button variant="primary" size="sm" onClick={openAdd}>
              <Plus size={16} className="mr-1" />
              {t('action.addUser')}
            </Button>
          }
        />

        <div className="px-4 py-4 space-y-3">
          {users === undefined ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t('empty.users.title')}
              description={t('empty.users.description')}
            />
          ) : (
            users.map((u: any) => (
              <Card key={u.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-text-primary font-medium mb-1">
                      {u.name}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={u.role === 'supervisor' ? 'available' : 'default'}>
                        {u.role}
                      </Badge>
                      <span className="text-xs text-text-secondary">
                        {siteName(u.siteId)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(u)}
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
          title={editingId != null ? t('action.editUser') : t('action.addUser')}
        >
          <div className="space-y-4">
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
                {t('field.pin')}
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="4-6 digits"
                value={form.pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setForm({ ...form, pin: val });
                }}
                inputMode="numeric"
                maxLength={6}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1 block">
                {t('field.role')}
              </label>
              <select
                className={inputClass}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as 'worker' | 'supervisor' })}
              >
                <option value="worker">{t('role.worker')}</option>
                <option value="supervisor">{t('role.supervisor')}</option>
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
            <Button
              variant="primary"
              fullWidth
              loading={saving}
              disabled={!form.name || !form.pin || form.pin.length < 4}
              onClick={handleSave}
            >
              {editingId != null ? t('action.save') : t('action.addUser')}
            </Button>
          </div>
        </Modal>
      </div>
    </AnimatedPage>
  );
}
