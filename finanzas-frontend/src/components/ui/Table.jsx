
export const Table = ({ children, className = '', wrapperClassName = 'overflow-x-auto' }) => {
  return (
    <div className={`w-full ${wrapperClassName}`}>
      <table className={`w-full text-left border-collapse text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
};


export const TableHead = ({ children, className = '' }) => {
  return (
    <thead className={`border-b border-slate-100 dark:border-[rgba(255,255,255,0.07)] text-slate-500 dark:text-[#94a3b8] text-xs font-bold uppercase tracking-wider ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '' }) => {
  return (
    <tbody className={`divide-y divide-slate-100 dark:divide-[rgba(255,255,255,0.07)] ${className}`}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', ...props }) => {
  return (
    <tr 
      className={`transition-all hover:bg-slate-50 dark:bg-[#1C1D2A] dark:hover:bg-[#1C1D2A]/80 ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableCell = ({ children, className = '', header = false, ...props }) => {
  const cellStyle = 'py-4 px-4 text-slate-700 dark:text-[#ffffff] align-middle';
  
  if (header) {
    return (
      <th className={`py-3 px-4 font-bold text-slate-500 dark:text-[#94a3b8] align-middle ${className}`} {...props}>
        {children}
      </th>
    );
  }
  
  return (
    <td className={`${cellStyle} ${className}`} {...props}>
      {children}
    </td>
  );
};
