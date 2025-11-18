import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function PageTitle({ title, subtitle, icon, className = '' }: PageTitleProps) {
  return (
    <div className={`text-center mb-12 ${className}`}>
      {icon && (
        <div className="page-title-icon animate-scale-in">
          {icon}
        </div>
      )}
      <h1 className="page-title animate-fade-in bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
        {title}
      </h1>
      {subtitle && (
        <p className="page-subtitle animate-slide-up">
          {subtitle}
        </p>
      )}
    </div>
  );
}
