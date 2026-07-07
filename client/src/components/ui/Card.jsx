const Card = ({ children, className = "", padded = true }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${padded ? "p-5" : ""} ${className}`}>
    {children}
  </div>
);

export default Card;
