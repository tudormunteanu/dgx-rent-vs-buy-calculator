import React, { ReactNode } from 'react';

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ title, subtitle, children, className = '' }) => (
  <section className={`mb-10 ${className}`}>
    <div className="mb-6 max-w-3xl">
      <h2 className="text-lg font-semibold text-dark mb-2">{title}</h2>
      {subtitle && <p className="text-neutral-600 text-sm leading-relaxed">{subtitle}</p>}
    </div>
    {children}
  </section>
);
