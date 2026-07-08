
export const Card = ({ children, className = '', hoverable = true, ...props }) => {
  return (
    <div
      className={`glass-card p-6 rounded-2xl ${hoverable ? 'hover:glass-card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, icon: Icon, className = '', ...props }) => {
  return (
    <h3
      className={`text-base font-bold flex items-center gap-2 text-slate-800 ${className}`}
      {...props}
    >
      {Icon && <Icon size={18} className="text-indigo-400" />}
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
};
