export const Table = ({ children }) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table className="min-w-full divide-y divide-slate-200 text-sm">{children}</table>
  </div>
);

export const Thead = ({ children }) => <thead className="bg-slate-50">{children}</thead>;

export const Th = ({ children, className = "" }) => (
  <th
    scope="col"
    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${className}`}
  >
    {children}
  </th>
);

export const Tbody = ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>;

export const Tr = ({ children, onClick, selected = false, className = "" }) => (
  <tr
    onClick={onClick}
    className={`${onClick ? "cursor-pointer" : ""} transition-colors ${
      selected ? "bg-brand-50" : "hover:bg-slate-50"
    } ${className}`}
  >
    {children}
  </tr>
);

export const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-3 align-middle text-slate-700 ${className}`}>{children}</td>
);

export const EmptyRow = ({ colSpan, children }) => (
  <tr>
    <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-slate-400">
      {children}
    </td>
  </tr>
);
