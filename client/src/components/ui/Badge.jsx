const tones = {
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  violet: "bg-violet-100 text-violet-800",
  green: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-800",
  orange: "bg-orange-100 text-orange-800",
  gray: "bg-slate-100 text-slate-700",
};

const Badge = ({ children, tone = "gray", className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${tones[tone]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
