'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'text-blue-500' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Outer ring with gradient */}
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-solid border-transparent border-t-accent-blue border-r-accent-purple animate-spin`}
          style={{
            animation: 'spin 1s linear infinite',
          }}
        />
        
        {/* Inner ring with gradient */}
        <div
          className={`${sizeClasses[size]} absolute top-0 left-0 rounded-full border-4 border-solid border-transparent border-b-accent-pink border-l-accent-blue animate-spin`}
          style={{
            animation: 'spin 1s linear infinite reverse',
          }}
        />
        
        {/* Pulsing center dot */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple animate-pulse`}
          style={{
            width: `${size === 'sm' ? '0.5rem' : size === 'md' ? '1rem' : '1.5rem'}`,
            height: `${size === 'sm' ? '0.5rem' : size === 'md' ? '1rem' : '1.5rem'}`,
          }}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner; 