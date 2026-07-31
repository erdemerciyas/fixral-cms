'use client';

import React from 'react';
import { ChevronDown as ChevronDownIcon } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dark';
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seçiniz...',
  className = '',
  disabled = false,
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm', 
    lg: 'px-4 py-3 text-base'
  };

  const variantClasses = {
    default: 'bg-background border-input text-foreground focus:border-primary focus:ring-ring/20',
    dark: 'bg-popover border-border text-popover-foreground focus:border-primary focus:ring-ring/20'
  };

  /* Printables input dili: 4px radius, 1px hairline border, dinlenimde gölge yok. */
  const baseClasses = `
    relative w-full rounded-sm border appearance-none cursor-pointer
    focus:outline-none focus:ring-2
    transition-[color,background-color,border-color,box-shadow] duration-200 ease-out
    disabled:cursor-not-allowed disabled:opacity-50
    pr-10
  `;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
        style={{
          backgroundImage: 'none' // Remove default arrow
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Custom arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
};

export default Select; 