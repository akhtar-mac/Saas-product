import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'theme'
    | 'secondary'
    | 'multicolor'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'panda'
    | 'call'
    | 'ca-call'
    | 'gold';
  size?: 'sm' | 'md' | 'lg';
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
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // All galaxy variants: white bg + rotating nebula border (light theme)
    const variants = {
      primary: 'btn-multicolor',
      theme: 'btn-multicolor',
      multicolor: 'btn-multicolor',
      secondary: 'btn-outline-multicolor',
      outline: 'btn-outline-multicolor',
      panda: 'btn-ca-call',
      call: 'btn-ca-call',
      'ca-call': 'btn-ca-call',
      gold: 'btn-gold',
      ghost:
        'relative cursor-pointer overflow-hidden rounded-xl bg-transparent hover:bg-[#FAF9F5] text-slate-700 transition-colors duration-200 font-semibold',
      danger:
        'relative cursor-pointer overflow-hidden rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-60 font-semibold',
    };

    const sizes = {
      sm: 'px-3.5 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    };

    const isGalaxy =
      variant === 'primary' ||
      variant === 'theme' ||
      variant === 'multicolor' ||
      variant === 'secondary' ||
      variant === 'outline';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center whitespace-nowrap shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {/* Floating star particles (galaxy variants only) */}
        {isGalaxy && <span className="btn-galaxy__stars" aria-hidden="true" />}

        {/* Content — z-[2] sits above the ::after white mask */}
        <span className="relative z-[2] inline-flex items-center justify-center gap-2">
          {isLoading ? (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : leftIcon ? (
            <span className="btn-galaxy__icon shrink-0">{leftIcon}</span>
          ) : null}
          <span>{children}</span>
          {!isLoading && rightIcon ? (
            <span className="btn-galaxy__icon shrink-0">{rightIcon}</span>
          ) : null}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
