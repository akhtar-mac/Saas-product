import React from 'react';
import { TaskStatus, TASK_STATUS_LABELS } from '@etaxwala/types';
import { CheckCircle2, Clock, AlertCircle, FileCheck, ArrowRight } from 'lucide-react';

export interface TimelineStep {
  status: TaskStatus;
  label?: string;
  description?: string;
  updatedAt?: string;
  updatedBy?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isFailed?: boolean;
}

export interface ServiceTimelineProps {
  currentStatus: TaskStatus | number;
  history?: Array<{
    status: number;
    title?: string;
    remarks?: string;
    date?: string;
    addedBy?: string;
  }>;
  className?: string;
}

const standardOrder: TaskStatus[] = [
  TaskStatus.DOCUMENTS_PENDING,
  TaskStatus.DOCUMENTS_COLLECTED,
  TaskStatus.VERIFICATION_IN_PROGRESS,
  TaskStatus.VERIFICATION_COMPLETED,
  TaskStatus.GOVT_FILING_IN_PROGRESS,
  TaskStatus.QC_REVIEW,
  TaskStatus.GOVT_APPROVAL_RECEIVED,
  TaskStatus.COMPLETED,
];

export function ServiceTimeline({ currentStatus, history, className = '' }: ServiceTimelineProps) {
  const currentNum = Number(currentStatus);
  const currentIndex = standardOrder.indexOf(currentNum as TaskStatus);

  return (
    <div className={`w-full py-4 ${className}`}>
      {/* Horizontal Stepper for Desktop */}
      <div className="hidden lg:flex items-center justify-between relative mb-8">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: `${
              currentIndex >= 0
                ? (currentIndex / (standardOrder.length - 1)) * 100
                : 0
            }%`,
          }}
        />

        {standardOrder.map((stepStatus, idx) => {
          const isDone = currentIndex > idx || currentNum === TaskStatus.COMPLETED;
          const isCurrent = currentIndex === idx;
          const label = TASK_STATUS_LABELS[stepStatus];

          return (
            <div key={stepStatus} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isDone
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40 animate-pulse'
                    : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 text-center max-w-[90px] leading-tight ${
                  isCurrent
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : isDone
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Vertical Detailed Timeline (History + Upcoming) */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Activity & Milestones Log
        </h4>

        {history && history.length > 0 ? (
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
            {history.map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title || TASK_STATUS_LABELS[item.status as TaskStatus] || `Stage ${item.status}`}
                    </span>
                    {item.date ? (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.date}
                      </span>
                    ) : null}
                  </div>
                  {item.remarks ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {item.remarks}
                    </p>
                  ) : null}
                  {item.addedBy ? (
                    <span className="inline-block text-[11px] text-blue-600 dark:text-blue-400 mt-2 font-medium">
                      Updated by: {item.addedBy}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
            Current stage: <strong className="text-slate-800 dark:text-slate-200">{TASK_STATUS_LABELS[currentNum as TaskStatus] || 'Processing'}</strong>. Updates will appear as progress is made by your assigned specialist.
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceTimeline;
