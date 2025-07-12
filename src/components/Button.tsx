// FILE: src/components/Button.tsx
// This version is updated to use the new semantic color palette for all variants.

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  className = '',
  fullWidth = false
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-semibold rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-4
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${fullWidth ? 'w-full' : ''}
    min-h-[48px] min-w-[48px] select-none
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const variantClasses = {
    primary: `
      bg-light-primary text-white
      dark:bg-dark-primary dark:text-light-text-primary
      hover:opacity-90
      focus:ring-light-primary/50 dark:focus:ring-dark-primary/50
      transform hover:scale-105 active:scale-97
    `,
    secondary: `
      bg-light-text-primary text-white
      dark:bg-dark-surface dark:text-dark-text-primary dark:border dark:border-dark-border
      hover:opacity-90
      focus:ring-gray-500/50
      transform hover:scale-105 active:scale-97
    `,
    outline: `
      bg-transparent border-2 border-light-border text-light-text-muted
      dark:border-dark-border dark:text-dark-text-muted
      hover:bg-light-surface hover:text-light-text-primary
      dark:hover:bg-dark-surface dark:hover:text-dark-text-primary
      focus:ring-gray-500/50
      transform hover:scale-105 active:scale-97
    `,
    ghost: `
      bg-transparent text-light-text-muted hover:bg-light-surface
      dark:text-dark-text-muted dark:hover:bg-dark-surface
      focus:ring-gray-500/50
      transform hover:scale-105 active:scale-97
    `,
    danger: `
      bg-error text-white
      dark:bg-dark-error
      hover:opacity-90
      focus:ring-error/50 dark:focus:ring-dark-error/50
      transform hover:scale-105 active:scale-97
    `
  };

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button; 