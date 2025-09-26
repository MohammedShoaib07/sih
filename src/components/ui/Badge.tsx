import React from 'react';
import { getSeverityColor, getStatusColor, getVerificationColor } from '../../styles/design-system';

interface BadgeProps {
  variant?: 'status' | 'severity' | 'verification' | 'default';
  value: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default', 
  value, 
  size = 'md',
  showDot = false,
  className = '' 
}) => {
  const getColors = () => {
    switch (variant) {
      case 'status':
        return getStatusColor(value);
      case 'severity':
        return getSeverityColor(value);
      case 'verification':
        return getVerificationColor(value);
      default:
        return {
          bg: '#f3f4f6',
          border: '#d1d5db',
          text: '#374151',
          accent: '#6b7280'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg': 
        return 'px-3 py-1 text-sm';
      default:
        return 'px-2.5 py-0.5 text-xs';
    }
  };

  const colors = getColors();
  
  const formatValue = (val: string) => {
    return val.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${getSizeClasses()}
        ${className}
      `}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`
      }}
    >
      {showDot && (
        <span 
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: colors.accent }}
        />
      )}
      {formatValue(value)}
    </span>
  );
};

export default Badge;
