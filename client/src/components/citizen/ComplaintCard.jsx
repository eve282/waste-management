import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { STATUS_META, formatLabel } from "../../utils/status";

const ComplaintCard = ({ complaint }) => {
  const meta = STATUS_META[complaint.status] || {};

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold capitalize text-slate-800">{formatLabel(complaint.category)}</h3>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>

      <p className="line-clamp-3 text-sm text-slate-600">{complaint.description}</p>

      {complaint.imageUrl && (
        <img
          src={complaint.imageUrl}
          alt="complaint"
          className="h-40 w-full rounded-lg object-cover"
        />
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">
          Submitted {new Date(complaint.createdAt).toLocaleDateString()}
        </span>
        <Link
          to={`/complaints/${complaint._id}`}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View details →
        </Link>
      </div>
    </Card>
  );
};

export default ComplaintCard;
