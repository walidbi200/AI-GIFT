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
    transition-all duration-200 transform hover:scale-105 active:scale-95
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const variantClasses = {
    primary: `
      bg-primary-600 text-white shadow-soft hover:shadow-medium
      hover:bg-primary-700 focus:ring-primary-500
      dark:bg-primary-500 dark:hover:bg-primary-600
    `,
    secondary: `
      bg-gray-600 text-white shadow-soft hover:shadow-medium
      hover:bg-gray-700 focus:ring-gray-500
      dark:bg-gray-500 dark:hover:bg-gray-600
    `,
    outline: `
      bg-transparent border-2 border-primary-600 text-primary-600
      hover:bg-primary-600 hover:text-white focus:ring-primary-500
      dark:border-primary-400 dark:text-primary-400
      dark:hover:bg-primary-400 dark:hover:text-white
    `,
    ghost: `
      bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500
      dark:text-gray-300 dark:hover:bg-gray-800
    `,
    danger: `
      bg-red-600 text-white shadow-soft hover:shadow-medium
      hover:bg-red-700 focus:ring-red-500
      dark:bg-red-500 dark:hover:bg-red-600
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