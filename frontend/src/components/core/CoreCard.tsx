import React from 'react';
import './CoreCard.css';

interface CoreCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const CoreCard: React.FC<CoreCardProps> = ({
  children,
  className = '',
  elevated = false,
  interactive = false,
  padding = 'lg',
  onClick,
  style,
}) => {
  const paddingClasses = {
    none: 'padding-none',
    sm: 'padding-sm',
    md: 'padding-md',
    lg: 'padding-lg',
  };

  return (
    <div
      className={`core-card ${elevated ? 'elevated' : ''} ${interactive ? 'interactive' : ''} ${paddingClasses[padding]} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      style={{ display: 'block', width: '100%', ...style }}
    >
      {children}
    </div>
  );
};

export const CoreCardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`core-card-header ${className}`}>
    {children}
  </div>
);

export const CoreCardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <h3 className={`core-card-title ${className}`}>
    {children}
  </h3>
);

export const CoreCardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <p className={`core-card-description ${className}`}>
    {children}
  </p>
);
