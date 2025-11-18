import React from 'react';

interface FormContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function FormContainer({ children, className = '' }: FormContainerProps) {
  return (
    <div className={`glass rounded-xl p-6 shadow-green-soft ${className}`}>
      {children}
    </div>
  );
}
