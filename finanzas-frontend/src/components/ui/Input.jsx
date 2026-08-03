import React from 'react';

export const FormGroup = ({ label, children, className = '', error }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="text-xs font-bold text-slate-500 dark:text-[#94a3b8] uppercase tracking-wider">
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
      className={`w-full bg-slate-50 dark:bg-[#1C1D2A] border border-slate-200/80 dark:border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-2.5 text-slate-800 dark:text-[#ffffff] text-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-[#94a3b8] focus:border-indigo-500 dark:focus:border-[#FB00FF]/50 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-[#FB00FF]/10 focus:bg-white dark:focus:bg-[#252636] disabled:bg-slate-100 dark:disabled:bg-[#1C1D2A] disabled:text-slate-400 disabled:border-slate-200/40 disabled:cursor-not-allowed ${className}`}
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
      className={`w-full bg-slate-50 dark:bg-[#1C1D2A] border border-slate-200/80 dark:border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-2.5 text-slate-800 dark:text-[#ffffff] text-sm outline-none transition-all focus:border-indigo-500 dark:focus:border-[#FB00FF]/50 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-[#FB00FF]/10 focus:bg-white dark:focus:bg-[#252636] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

Input.displayName = 'Input';
Select.displayName = 'Select';
