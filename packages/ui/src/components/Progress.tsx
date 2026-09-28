import React from 'react';
import { cn } from '../lib/cn';

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0–100
  max?: number;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const colors = {
  blue: 'bg-blue-600',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  violet: 'bg-violet-600',
};

const heights = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  color = 'blue',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  className,
  ...props
}) => {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)} {...props}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
          {showLabel && (
            <span className="text-xs text-slate-500 dark:text-slate-400">{Math.round(percent)}%</span>
          )}
        </div>
      )}
      <div
        className={cn('w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden', heights[size])}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colors[color],
            animated && 'bg-gradient-to-r from-current/80 to-current animate-pulse'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

// ─── Circular Progress ────────────────────────────────────────────────────────
export interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
  label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 48,
  strokeWidth = 4,
  color = '#3b82f6',
  trackColor = '#e2e8f0',
  showLabel = true,
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label || `${Math.round(percent)}%`}
        </span>
      )}
    </div>
  );
};

export default Progress;
