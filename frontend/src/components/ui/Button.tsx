import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  isLoading = false
}) => {
  // Base classes
  let classes = 'font-medium rounded-md focus:outline-none transition-colors duration-200 inline-flex items-center justify-center';
  
  // Size classes
  if (size === 'sm') {
    classes += ' px-3 py-1.5 text-xs';
  } else if (size === 'md') {
    classes += ' px-4 py-2 text-sm';
  } else if (size === 'lg') {
    classes += ' px-5 py-2.5 text-base';
  }
  
  // Variant classes
  if (variant === 'primary') {
    classes += ' bg-primary-500 text-white hover:bg-primary-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  } else if (variant === 'secondary') {
    classes += ' bg-secondary-200 text-secondary-800 hover:bg-secondary-300 focus:ring-2 focus:ring-offset-2 focus:ring-secondary-200';
  } else if (variant === 'danger') {
    classes += ' bg-danger text-white hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500';
  } else if (variant === 'outline') {
    classes += ' bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  }
  
  // Width classes
  if (fullWidth) {
    classes += ' w-full';
  }
  
  // Disabled classes
  if (disabled || isLoading) {
    classes += ' opacity-60 cursor-not-allowed';
  }
  
  return (
    <button
      type={type}
      className={`${classes} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
