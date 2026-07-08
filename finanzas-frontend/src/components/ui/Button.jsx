
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
    primary: 'bg-[#18191b] hover:bg-[#2b2d30] text-white shadow-sm border border-slate-950/15',
    secondary: 'bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700',
    danger: 'bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-800'
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
