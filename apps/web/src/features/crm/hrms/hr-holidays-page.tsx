/** HR desk — holiday calendar: add, edit, remove (kept for history) and mark on everyone's sheet. */
import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, CalendarPlus, Pencil, Stamp, Trash2 } from 'lucide-react';
import { api, ddmmyyyy, Holiday, todayIST } from './hrms-api';
import {
  Card,
  DateInput,
  Empty,
  inputCls,
  labelCls,
  Notice,
  PageHeader,
  StatTile,
  useToast,
} from './hrms-ui';
import { CrmModal } from '@/components/ui/crm-modal';

const TYPE_CLS: Record<string, string> = {
  public: 'bg-sky-50 text-sky-800 border-sky-200',
  company: 'bg-[#EEF3F8] text-[#1B365D] border-[#D9E2EC]',
  optional: 'bg-amber-50 text-amber-800 border-amber-200',
};

export default function HrHolidaysPage() {
  const [year, setYear] = useState(Number(todayIST().slice(0, 4)));
  const [items, setItems] = useState<Holiday[]>([]);
  const [ready, setReady] = useState(true);
  const [edit, setEdit] = useState<Partial<Holiday> | null>(null);
  const [confirm, setConfirm] = useState<{ h: Holiday; kind: 'remove' | 'apply' } | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const load = useCallback(() => {
    api<{ data: Holiday[]; tables_ready: boolean }>('/v1/crm/hrms/holidays', {
      query: { year },
    }).then((r) => {
      setItems(r.data);
      setReady(r.tables_ready);
    });
  }, [year]);
  useEffect(load, [load]);
  const save = async () => {
    if (!edit) return;
    setBusy(true);
    setErr('');
    try {
      const body = {
        holiday_date: edit.holiday_date,
        title: edit.title,
        holiday_type: edit.holiday_type || 'public',
        description: edit.description || null,
      };
      if (edit.id) await api(`/v1/crm/hrms/holidays/${edit.id}`, { method: 'PATCH', body });
      else await api('/v1/crm/hrms/holidays', { method: 'POST', body });
      toast.ok(edit.id ? 'Holiday updated' : 'Holiday added');
      setEdit(null);
      load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  const doConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.kind === 'remove') {
        await api(`/v1/crm/hrms/holidays/${confirm.h.id}`, { method: 'DELETE' });
        toast.ok('Holiday removed');
      } else {
        const r = await api<{ data: { marked: number; kept_existing: number } }>(
          `/v1/crm/hrms/holidays/${confirm.h.id}/apply`,
          { method: 'POST' }
        );
        toast.ok(
          `Marked as holiday for ${r.data.marked} staff (${r.data.kept_existing} already marked, kept)`
        );
      }
      setConfirm(null);
      load();
    } catch (e: any) {
      toast.err(e.message);
    } finally {
      setBusy(false);
    }
  };
  const today = todayIST();
  const upcoming = items.filter((h) => h.holiday_date >= today);
  return (
    <div className="space-y-4">
      <PageHeader
        icon={<CalendarDays className="w-5 h-5" />}
        title="Holiday Calendar"
        subtitle="Holidays show on everyone's profile and are not counted in leave days."
        actions={
          <button
            className="btn-multicolor btn-sm inline-flex items-center gap-1.5"
            disabled={!ready}
            onClick={() => {
              setErr('');
              setEdit({ holiday_type: 'public', holiday_date: todayIST(1) });
            }}
          >
            <CalendarPlus className="w-3.5 h-3.5" /> Add holiday
          </button>
        }
      />
      {!ready && (
        <Notice>The HR tables are not added yet — the holiday calendar is switched off.</Notice>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <StatTile label={`Holidays ${year}`} value={items.length} tone="navy" />
        <StatTile
          label="Upcoming"
          value={upcoming.length}
          tone="sky"
          sub={
            upcoming[0] ? `Next: ${upcoming[0].title} · ${ddmmyyyy(upcoming[0].holiday_date)}` : '—'
          }
        />
        <StatTile
          label="Public"
          value={items.filter((h) => h.holiday_type === 'public').length}
          tone="emerald"
        />
        <StatTile
          label="Optional"
          value={items.filter((h) => h.holiday_type === 'optional').length}
          tone="amber"
        />
      </div>
      <Card
        title={`${year}`}
        icon={<CalendarDays className="w-4 h-4" />}
        pad={false}
        actions={
          <div className="flex gap-1">
            {[year - 1, year, year + 1].map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`etx-filter-pill py-1 px-3 text-[11.5px] ${y === year ? 'is-selected' : ''}`}
              >
                {y}
              </button>
            ))}
          </div>
        }
      >
        {!items.length ? (
          <Empty
            icon={<CalendarDays className="w-6 h-6" />}
            text="No holidays added for this year."
          />
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-wider text-slate-400 border-b border-[#EFECE6]">
                <th className="px-4 py-2">Date</th>
                <th className="px-2 py-2">Day</th>
                <th className="px-2 py-2">Holiday</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((h) => {
                const past = h.holiday_date < today;
                return (
                  <tr
                    key={h.id}
                    className={`border-b border-[#F3F1EC] last:border-0 ${past ? 'text-slate-400' : ''}`}
                  >
                    <td className="px-4 py-2.5 font-bold text-[#1B365D] whitespace-nowrap">
                      {ddmmyyyy(h.holiday_date)}
                    </td>
                    <td className="px-2 py-2.5">
                      {new Date(h.holiday_date + 'T00:00:00Z').toLocaleString('en-IN', {
                        weekday: 'long',
                        timeZone: 'UTC',
                      })}
                    </td>
                    <td className="px-2 py-2.5">
                      <p className="font-semibold text-slate-800">{h.title}</p>
                      {h.description && (
                        <p className="text-[11px] text-slate-500">{h.description}</p>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border capitalize ${TYPE_CLS[h.holiday_type]}`}
                      >
                        {h.holiday_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          className="btn-outline btn-sm inline-flex items-center gap-1"
                          title="Mark this day as holiday for everyone not yet marked"
                          onClick={() => setConfirm({ h, kind: 'apply' })}
                        >
                          <Stamp className="w-3.5 h-3.5" /> Mark on sheet
                        </button>
                        <button
                          className="btn-outline btn-sm"
                          title="Edit"
                          onClick={() => {
                            setErr('');
                            setEdit(h);
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="btn-outline btn-sm text-rose-600"
                          title="Remove"
                          onClick={() => setConfirm({ h, kind: 'remove' })}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
      <CrmModal
        isOpen={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? 'Edit holiday' : 'Add holiday'}
        icon={<CalendarPlus className="w-4 h-4" />}
        size="md"
      >
        {edit && (
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={labelCls}>Date</span>
                <DateInput
                  ariaLabel="Holiday date"
                  value={edit.holiday_date || ''}
                  onChange={(v) => setEdit({ ...edit, holiday_date: v })}
                />
              </label>
              <label>
                <span className={labelCls}>Type</span>
                <select
                  className={inputCls}
                  value={edit.holiday_type}
                  onChange={(e) =>
                    setEdit({ ...edit, holiday_type: e.target.value as Holiday['holiday_type'] })
                  }
                >
                  <option value="public">Public holiday</option>
                  <option value="company">Company holiday</option>
                  <option value="optional">Optional holiday</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className={labelCls}>Name</span>
              <input
                className={inputCls}
                value={edit.title || ''}
                placeholder="e.g. Diwali"
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              />
            </label>
            <label className="block">
              <span className={labelCls}>Note (optional)</span>
              <input
                className={inputCls}
                value={edit.description || ''}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
              />
            </label>
            {err && <p className="text-xs text-rose-600">{err}</p>}
            <div className="flex justify-end gap-2">
              <button className="btn-outline btn-sm" onClick={() => setEdit(null)}>
                Cancel
              </button>
              <button className="btn-multicolor btn-sm" disabled={busy} onClick={save}>
                {busy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </CrmModal>
      <CrmModal
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.kind === 'remove' ? 'Remove holiday?' : 'Mark on attendance sheet?'}
        icon={
          confirm?.kind === 'remove' ? (
            <Trash2 className="w-4 h-4" />
          ) : (
            <Stamp className="w-4 h-4" />
          )
        }
        size="sm"
      >
        {confirm && (
          <div className="p-5 space-y-3 text-xs text-slate-600">
            <p>
              <b>{confirm.h.title}</b> · {ddmmyyyy(confirm.h.holiday_date)}
            </p>
            <p>
              {confirm.kind === 'remove'
                ? 'It will no longer show on profiles. It is kept in the history and the change is logged. Days already marked on the sheet stay as they are.'
                : 'Everyone who is not marked yet for this day will be marked Holiday. Days already marked (present, WFH, leave…) are never changed.'}
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn-outline btn-sm" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                className={`${confirm.kind === 'remove' ? 'btn-danger' : 'btn-multicolor'} btn-sm`}
                disabled={busy}
                onClick={doConfirm}
              >
                {busy ? 'Working…' : confirm.kind === 'remove' ? 'Remove' : 'Mark holiday'}
              </button>
            </div>
          </div>
        )}
      </CrmModal>
      {toast.node}
    </div>
  );
}
