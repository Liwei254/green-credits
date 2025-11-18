import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

export default function StatCard({
  icon,
  value,
  label,
  change,
  changeType = 'neutral',
  className = ''
}: StatCardProps) {
  return (
    <div className={`glass rounded-xl p-6 hover-scale transition-all duration-300 shadow-green-soft ${className}`}>
      <div className="stat-card-icon">
        {icon}
      </div>
      <div className="stat-card-value">
        {value}
      </div>
      <div className="stat-card-label">
        {label}
      </div>
      {change && (
        <div className={`stat-card-change ${changeType}`}>
          {change}
        </div>
      )}
    </div>
  );
}
