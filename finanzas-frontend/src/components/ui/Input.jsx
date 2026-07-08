import React from 'react';

export const FormGroup = ({ label, children, className = '', error }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      )}
      {children}
      {error && <span className="text-xs text-rose-500 font-semibold">{error}</span>}
    </div>
  );
};

export const Input = React.forwardRef(({ 
  id,
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  required = false,
  ...props 
}, ref) => {
  return (
    <input
      id={id}
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-800 text-sm outline-none transition-all placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white ${className}`}
      {...props}
    />
  );
});

export const Select = React.forwardRef(({ 
  id,
  children, 
  value, 
  onChange, 
  className = '', 
  required = false,
  ...props 
}, ref) => {
  return (
    <select
      id={id}
      ref={ref}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-800 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

Input.displayName = 'Input';
Select.displayName = 'Select';
