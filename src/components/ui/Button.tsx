import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md', 
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-slate-600 hover:bg-slate-700 text-white shadow-sm border border-transparent';
      case 'secondary':
        return 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm';
      case 'ghost':
        return 'hover:bg-gray-100 text-gray-700 border border-transparent';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent';
      default:
        return 'bg-slate-600 hover:bg-slate-700 text-white shadow-sm border border-transparent';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 
        font-medium rounded-lg
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${isDisabled ? 'pointer-events-none' : 'hover:scale-[1.02] active:scale-[0.98]'}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="w-4 h-4 flex items-center justify-center">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
