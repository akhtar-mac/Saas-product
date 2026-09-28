import React from 'react';
import { TaskStatus, TASK_STATUS_LABELS, LeadStatus, LEAD_STATUS_LABELS } from '@etaxwala/types';
import { Badge } from './badge';

interface TaskStatusBadgeProps {
  status: TaskStatus | number;
  className?: string;
}

export function TaskStatusBadge({ status, className = '' }: TaskStatusBadgeProps) {
  const statusNum = typeof status === 'number' ? status : Number(status);
  
  const statusConfig: Record<number, { label: string; variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
    [TaskStatus.DOCUMENTS_PENDING]: { label: 'Documents Pending', variant: 'warning' },
    [TaskStatus.DOCUMENTS_COLLECTED]: { label: 'Docs Collected', variant: 'info' },
    [TaskStatus.VERIFICATION_IN_PROGRESS]: { label: 'Verification In Progress', variant: 'primary' },
    [TaskStatus.VERIFICATION_COMPLETED]: { label: 'Verified', variant: 'success' },
    [TaskStatus.GOVT_FILING_IN_PROGRESS]: { label: 'Govt Filing In Progress', variant: 'primary' },
    [TaskStatus.GOVT_QUERY_RECEIVED]: { label: 'Govt Query / Resubmit', variant: 'danger' },
    [TaskStatus.GOVT_APPROVAL_RECEIVED]: { label: 'Govt Approved', variant: 'success' },
    [TaskStatus.QC_REVIEW]: { label: 'QC Review', variant: 'info' },
    [TaskStatus.COMPLETED]: { label: 'Completed', variant: 'success' },
    [TaskStatus.CANCELLED]: { label: 'Cancelled', variant: 'neutral' },
  };

  const current = statusConfig[statusNum] || {
    label: TASK_STATUS_LABELS[statusNum as TaskStatus] || `Status ${statusNum}`,
    variant: 'neutral',
  };

  return (
    <Badge variant={current.variant} className={className}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75 animate-pulse" />
      {current.label}
    </Badge>
  );
}

interface LeadStatusBadgeProps {
  status: LeadStatus | number;
  className?: string;
}

export function LeadStatusBadge({ status, className = '' }: LeadStatusBadgeProps) {
  const statusNum = typeof status === 'number' ? status : Number(status);

  const statusConfig: Record<number, { label: string; variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
    [LeadStatus.NEW]: { label: 'New Lead', variant: 'info' },
    [LeadStatus.ASSIGNED]: { label: 'Assigned', variant: 'primary' },
    [LeadStatus.CONTACTED]: { label: 'Contacted', variant: 'secondary' },
    [LeadStatus.FOLLOW_UP]: { label: 'Follow Up', variant: 'warning' },
    [LeadStatus.QUOTATION_SENT]: { label: 'Quote Sent', variant: 'primary' },
    [LeadStatus.CONVERTED]: { label: 'Converted', variant: 'success' },
    [LeadStatus.PAYMENT_PENDING]: { label: 'Payment Pending', variant: 'warning' },
    [LeadStatus.CLOSED_WON]: { label: 'Won', variant: 'success' },
    [LeadStatus.CLOSED_LOST]: { label: 'Lost', variant: 'danger' },
    [LeadStatus.NOT_INTERESTED]: { label: 'Not Interested', variant: 'neutral' },
    [LeadStatus.INVALID_NUMBER]: { label: 'Invalid Number', variant: 'danger' },
  };

  const current = statusConfig[statusNum] || {
    label: LEAD_STATUS_LABELS[statusNum as LeadStatus] || `Status ${statusNum}`,
    variant: 'neutral',
  };

  return (
    <Badge variant={current.variant} className={className}>
      {current.label}
    </Badge>
  );
}
