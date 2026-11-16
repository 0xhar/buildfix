import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  labelClassName = '',
  inputClassName = '',
  ...props
}) => {
  // Generate ID from name if not provided
  const id = props.id || props.name;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={`
            mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-300' : 'border-gray-300'} 
            rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-primary-500 focus:border-primary-500 
            sm:text-sm ${inputClassName}
          `}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
