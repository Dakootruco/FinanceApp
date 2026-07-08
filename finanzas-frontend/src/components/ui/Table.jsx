
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
    <thead className={`border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '' }) => {
  return (
    <tbody className={`divide-y divide-slate-100 ${className}`}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', ...props }) => {
  return (
    <tr 
      className={`transition-all hover:bg-slate-50/80 ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableCell = ({ children, className = '', header = false, ...props }) => {
  const cellStyle = 'py-4 px-4 text-slate-700 align-middle';
  
  if (header) {
    return (
      <th className={`py-3 px-4 font-bold text-slate-500 align-middle ${className}`} {...props}>
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
