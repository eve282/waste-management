const baseControl =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-slate-100";

export const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    {label && <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>}
    {children}
  </div>
);

export const Input = (props) => <input {...props} className={`${baseControl} ${props.className || ""}`} />;

export const Textarea = (props) => (
  <textarea {...props} className={`${baseControl} ${props.className || ""}`} />
);

export const Select = ({ children, ...props }) => (
  <select {...props} className={`${baseControl} ${props.className || ""}`}>
    {children}
  </select>
);

export default Field;
