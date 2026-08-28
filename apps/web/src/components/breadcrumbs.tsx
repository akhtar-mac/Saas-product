import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { clsx as cn } from 'clsx';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  /** Auto-generate from current URL if no items provided */
  autoGenerate?: boolean;
  className?: string;
  homeLabel?: string;
  separator?: React.ReactNode;
}

function slugToLabel(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function useAutocrumbs(): BreadcrumbItem[] {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  return segments.map((seg, i) => ({
    label: slugToLabel(seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }));
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  autoGenerate = false,
  className,
  homeLabel = 'Home',
  separator,
}) => {
  const autoItems = useAutocrumbs();
  const crumbs: BreadcrumbItem[] = [
    { label: homeLabel, href: '/' },
    ...(items || (autoGenerate ? autoItems : [])),
  ];

  const sep = separator || <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 flex-wrap text-sm', className)}>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span aria-hidden="true">{sep}</span>}
            {isLast ? (
              <span
                aria-current="page"
                className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px]"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.href || '/'}
                className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {i === 0 && <Home size={13} />}
                <span>{crumb.label}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
