import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded bg-forest-800/80 border border-forest-750/30 ${className}`}
    />
  );
};

export const RouteCardsSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-forest-850/60 border border-forest-750/40 space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC<{ title?: string }> = ({ title }) => {
  return (
    <div className="p-5 rounded-xl bg-forest-850/80 border border-forest-750/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {title ? (
            <h4 className="text-sm font-semibold text-forest-100">{title}</h4>
          ) : (
            <Skeleton className="h-5 w-40" />
          )}
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
};

