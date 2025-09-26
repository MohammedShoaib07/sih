import React from 'react';

interface CardProps {
  variant?: 'default' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  onClick
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white border border-gray-200 shadow-lg';
      case 'interactive':
        return 'bg-white border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200';
      default:
        return 'bg-white border border-gray-200 shadow-sm';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-3';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  return (
    <div
      className={`
        rounded-xl overflow-hidden
        ${getVariantClasses()}
        ${getPaddingClasses()}
        ${onClick ? 'hover:scale-[1.01] active:scale-[0.99]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
