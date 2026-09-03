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

  const sep = separator || <ChevronRight size={12} className="text-slate-300 shrink-0 mx-0.5" />;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-[#EAE6DD] text-xs text-slate-600 shadow-xs hover:shadow-sm hover:border-[#7C3AED]/30 transition-all flex-wrap',
        className
      )}
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span aria-hidden="true" className="flex items-center">{sep}</span>}
            {isLast ? (
              <span
                aria-current="page"
                className="font-medium text-slate-800 bg-[#FAF9F5] px-2 py-0.5 rounded-md border border-[#EAE6DD]/60 truncate max-w-[220px]"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.href || '/'}
                className="group flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors py-0.5 px-1 rounded-md hover:bg-[#FAF9F5]"
              >
                {i === 0 && (
                  <Home size={12} className="shrink-0 text-slate-400 group-hover:text-[#0084D1] transition-colors" />
                )}
                <span className="font-normal group-hover:text-multicolor transition-all">{crumb.label}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;

