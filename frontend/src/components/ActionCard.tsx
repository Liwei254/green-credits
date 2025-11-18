import React from 'react';

interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

export default function ActionCard({
  icon,
  title,
  description,
  onClick,
  className = ''
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`glass rounded-xl p-6 hover-scale transition-all duration-300 shadow-green-soft cursor-pointer ${className}`}
      type="button"
    >
      <div className="text-4xl mb-4">
        {icon}
      </div>
      <h3 className="action-card-title">
        {title}
      </h3>
      <p className="action-card-description">
        {description}
      </p>
    </button>
  );
}
