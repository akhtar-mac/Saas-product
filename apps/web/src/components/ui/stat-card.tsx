import React from 'react';
import { Card } from './card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: string | number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  iconBgColor = 'bg-blue-50 dark:bg-blue-950/60',
  iconColor = 'text-blue-600 dark:text-blue-400',
  className = '',
  onClick,
}: StatCardProps) {
  return (
    <Card
      className={`p-5 relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{value}</h3>
          
          {change || subtitle ? (
            <div className="flex items-center gap-1.5 mt-2">
              {change ? (
                <span
                  className={`inline-flex items-center text-xs font-semibold ${
                    change.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {change.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  )}
                  {change.value}
                </span>
              ) : null}
              {subtitle ? (
                <span className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</span>
              ) : null}
            </div>
          ) : null}
        </div>

        {Icon ? (
          <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor} shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export default StatCard;
