/** HR desk — leave approvals. Approve / reject with a remark; approved leave marks attendance. */
import React, { useCallback, useEffect, useState } from 'react';
import { Check, Inbox, Plane, X } from 'lucide-react';
import { api, ddmmyyyy, fmtIST, LeaveRequest, LEAVE_LABEL } from './hrms-api';
import { Avatar, Card, Empty, inputCls, labelCls, Notice, PageHeader, useToast } from './hrms-ui';
import { LeaveStatus } from './my-profile-page';
import { CrmModal } from '@/components/ui/crm-modal';

type St = 'pending' | 'approved' | 'rejected' | 'cancelled' | '';

export default function HrLeavesPage() {
  const [status, setStatus] = useState<St>('pending');
  const [d, setD] = useState<{
    requests: LeaveRequest[];
    counts: Record<string, number>;
    tables_ready: boolean;
    can_approve: boolean;
    viewer: { source: string; id: number; can_approve_own: boolean };
  } | null>(null);
  const isOwn = (l: LeaveRequest) =>
    !!d &&
    d.viewer.source === l.user_source &&
    d.viewer.id === l.user_id &&
    !d.viewer.can_approve_own;
  const [act, setAct] = useState<{ l: LeaveRequest; kind: 'approve' | 'reject' } | null>(null);
  const [remark, setRemark] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const load = useCallback(() => {
    api<{ data: any }>('/v1/crm/hrms/leaves', { query: { status } }).then((r) => setD(r.data));
  }, [status]);
  useEffect(load, [load]);
  const submit = async () => {
    if (!act) return;
    setBusy(true);
    setErr('');
    try {
      const r = await api<{ data: any }>(`/v1/crm/hrms/leaves/${act.l.id}/${act.kind}`, {
        method: 'POST',
        body: { remark },
      });
      toast.ok(
        act.kind === 'approve'
          ? `Approved · ${r.data?.attendance_marked?.length ?? 0} day(s) marked on the attendance sheet`
          : 'Leave request rejected'
      );
      setAct(null);
      setRemark('');
      load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  const pills: [St, string][] = [
    ['pending', 'Pending'],
    ['approved', 'Approved'],
    ['rejected', 'Rejected'],
    ['cancelled', 'Cancelled'],
    ['', 'All'],
  ];
  return (
    <div className="space-y-4">
      <PageHeader
        icon={<Plane className="w-5 h-5" />}
        title="Leave Approvals"
        subtitle="Staff apply from My Profile. Approving marks the days as leave on the attendance sheet."
      />
      {d && !d.tables_ready && (
        <Notice>The HR tables are not added yet — leave requests are switched off.</Notice>
      )}
      <div className="flex flex-wrap gap-1.5">
        {pills.map(([v, l]) => (
          <button
            key={l}
            className={`etx-filter-pill py-1 px-3 text-[11.5px] ${status === v ? 'is-selected' : ''}`}
            onClick={() => setStatus(v)}
          >
            {l}
            {v && d && (
              <span className="etx-pill-count ml-1 px-1.5 rounded-full text-[10px]">
                {d.counts[v] ?? 0}
              </span>
            )}
          </button>
        ))}
      </div>
      <Card pad={false}>
        {!d?.requests.length ? (
          <Empty
            icon={<Inbox className="w-6 h-6" />}
            text={
              status === 'pending' ? 'No leave requests waiting. All caught up.' : 'Nothing here.'
            }
          />
        ) : (
          <ul className="divide-y divide-[#F3F1EC]">
            {d.requests.map((l) => (
              <li key={l.id} className="px-4 py-3 flex flex-wrap items-start gap-3">
                <Avatar name={l.name || l.user_name || '?'} photo={l.photo} size={38} />
                <div className="flex-1 min-w-[240px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-extrabold text-slate-800" data-pii="name">
                      {l.name || l.user_name}
                    </p>
                    <span className="text-[10.5px] text-slate-400">
                      {l.employee_code || ''} {l.department ? `· ${l.department}` : ''}
                    </span>
                    <LeaveStatus s={l.status} />
                  </div>
                  <p className="text-[12px] text-slate-700 mt-0.5">
                    <b>{LEAVE_LABEL[l.leave_type] || l.leave_type}</b> · {ddmmyyyy(l.from_date)}
                    {l.to_date !== l.from_date && <> – {ddmmyyyy(l.to_date)}</>}
                    {l.is_half_day && (
                      <> · {l.half_day_slot === 'first_half' ? 'first half' : 'second half'}</>
                    )}{' '}
                    · <b>{l.total_days}</b> day(s)
                  </p>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">“{l.reason}”</p>
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    Applied {fmtIST(l.created_at)}
                    {l.reviewed_at && (
                      <>
                        {' '}
                        · {l.status} by {l.reviewed_by_name} on {fmtIST(l.reviewed_at)}
                        {l.review_remark && <> — “{l.review_remark}”</>}
                      </>
                    )}
                  </p>
                </div>
                {l.status === 'pending' && d.can_approve && isOwn(l) && (
                  <span className="text-[10.5px] text-slate-400 max-w-[180px] text-right">
                    Your own request — another HR person or an admin approves it.
                  </span>
                )}
                {l.status === 'pending' && d.can_approve && !isOwn(l) && (
                  <div className="flex gap-2">
                    <button
                      className="btn-danger btn-sm inline-flex items-center gap-1"
                      onClick={() => {
                        setErr('');
                        setRemark('');
                        setAct({ l, kind: 'reject' });
                      }}
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      className="btn-multicolor btn-success btn-sm inline-flex items-center gap-1"
                      onClick={() => {
                        setErr('');
                        setRemark('');
                        setAct({ l, kind: 'approve' });
                      }}
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <CrmModal
        isOpen={!!act}
        onClose={() => setAct(null)}
        title={act?.kind === 'approve' ? 'Approve leave' : 'Reject leave'}
        description={
          act
            ? `${act.l.name || act.l.user_name} · ${LEAVE_LABEL[act.l.leave_type]} · ${ddmmyyyy(act.l.from_date)}${act.l.to_date !== act.l.from_date ? ' – ' + ddmmyyyy(act.l.to_date) : ''} · ${act.l.total_days} day(s)`
            : ''
        }
        icon={act?.kind === 'approve' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        size="md"
      >
        <div className="p-5 space-y-3">
          <label className="block">
            <span className={labelCls}>
              Remark {act?.kind === 'reject' ? '(required)' : '(optional)'}
            </span>
            <textarea
              rows={3}
              className={inputCls}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder={act?.kind === 'reject' ? 'Why is it rejected?' : 'Note for the employee'}
            />
          </label>
          {act?.kind === 'approve' && (
            <p className="text-[11px] text-slate-500">
              Working days in this leave will be marked as leave on the attendance sheet. Days HR
              already marked present are kept.
            </p>
          )}
          {err && <p className="text-xs text-rose-600">{err}</p>}
          <div className="flex justify-end gap-2">
            <button className="btn-outline btn-sm" onClick={() => setAct(null)}>
              Cancel
            </button>
            <button
              className={`${act?.kind === 'approve' ? 'btn-multicolor btn-success' : 'btn-danger'} btn-sm`}
              disabled={busy}
              onClick={submit}
            >
              {busy ? 'Saving…' : act?.kind === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </div>
        </div>
      </CrmModal>
      {toast.node}
    </div>
  );
}
