import React from 'react';
import './LoadingState.css';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando...',
  size = 'md',
}) => {
  return (
    <div className="loading-state-container">
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-ring" />
        <div className="spinner-ring" />
        <div className="spinner-ring" />
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`loading-skeleton ${className}`} />;
};
