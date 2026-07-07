import { STATUS_STEPS, STATUS_META } from "../../utils/status";

const StatusTracker = ({ currentStatus }) => {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="flex items-center">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIndex;
        const isLast = idx === STATUS_STEPS.length - 1;
        return (
          <div key={step} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  done ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {idx + 1}
              </div>
              <span className={`mt-1 text-xs ${done ? "text-slate-700" : "text-slate-400"}`}>
                {STATUS_META[step].label}
              </span>
            </div>
            {!isLast && (
              <div className={`mx-2 h-0.5 flex-1 ${idx < currentIndex ? "bg-brand-600" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTracker;
