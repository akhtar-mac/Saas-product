import React from 'react';
import { cn } from '../lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'theme' | 'multicolor' | 'ca-call' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
      primary: 'btn-multicolor',
      theme: 'btn-multicolor',
      multicolor: 'btn-multicolor',
      'ca-call': 'btn-ca-call',
      secondary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm focus:ring-slate-700 rounded-lg',
      accent: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow focus:ring-emerald-500 rounded-lg',
      outline: 'btn-outline-multicolor',
      ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-slate-300 rounded-lg',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 rounded-lg',
    };

    const sizes = {
      sm: 'px-3.5 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3.5 text-base gap-2.5',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : leftIcon ? (
          <span className="shrink-0 relative z-[2]">{leftIcon}</span>
        ) : null}
        {children && <span className="relative z-[2]">{children}</span>}
        {!isLoading && rightIcon ? <span className="shrink-0 relative z-[2] btn-galaxy__icon">{rightIcon}</span> : null}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
