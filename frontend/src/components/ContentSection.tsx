import React from 'react';

interface ContentSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ContentSection({
  title,
  description,
  children,
  className = ''
}: ContentSectionProps) {
  return (
    <section className={`content-section ${className}`}>
      <h2 className="content-section-title animate-fade-in text-white">
        {title}
      </h2>
      {description && (
        <p className="content-section-description animate-slide-up text-gray-400">
          {description}
        </p>
      )}
      <div className="animate-scale-in">
        {children}
      </div>
    </section>
  );
}
