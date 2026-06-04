import React from 'react';

/**
 * Placeholder card with shimmer styling to represent movie poster loading state
 */
export const SkeletonCard = ({ size = 'md' }) => {
  const widthClasses = {
    sm: 'w-[130px]',
    md: 'w-[190px]',
    lg: 'w-[240px]',
  };

  return (
    <div className={`flex-shrink-0 rounded-lg overflow-hidden bg-card ${widthClasses[size] || widthClasses.md}`}>
      <div className="shimmer w-full aspect-[2/3]" />
      <div className="p-3 bg-[#111111] space-y-2">
        <div className="shimmer h-4 rounded w-4/5" />
        <div className="shimmer h-3 rounded w-2/5" />
      </div>
    </div>
  );
};

export default SkeletonCard;
