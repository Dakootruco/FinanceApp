
export const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  disabled = false,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-sans font-semibold text-sm rounded-xl px-5 py-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-[#18191b] hover:bg-[#2b2d30] text-white shadow-sm border border-slate-950/15 dark:bg-[#FB00FF] dark:hover:bg-[#d900dc] dark:border-transparent dark:shadow-[0_0_16px_rgba(251,0,255,0.35)] dark:hover:shadow-[0_0_22px_rgba(251,0,255,0.55)]',
    secondary: 'bg-slate-100 dark:bg-[#1C1D2A] hover:bg-slate-200 dark:bg-[#1C1D2A]/80 border border-slate-200 dark:border-[rgba(255,255,255,0.07)] text-slate-700 dark:text-[#ffffff] dark:bg-[#1C1D2A] dark:hover:bg-[#252636] dark:border-[rgba(255,255,255,0.07)] dark:text-[#ffffff]',
    danger: 'bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 dark:bg-[#1C1D2A] text-slate-500 dark:text-[#94a3b8] hover:text-slate-800 dark:text-[#ffffff] dark:hover:bg-[#1C1D2A] dark:text-[#94a3b8] dark:hover:text-[#ffffff]'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
