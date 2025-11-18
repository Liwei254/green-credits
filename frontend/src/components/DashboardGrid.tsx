import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardGrid({ children, className = '' }: DashboardGridProps) {
  return (
    <div className={`dashboard-grid gap-6 ${className}`}>
      {children}
    </div>
  );
}
