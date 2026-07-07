import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import StatusTracker from "../components/citizen/StatusTracker";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import PageLoader from "../components/ui/PageLoader";
import { STATUS_META, PRIORITY_META, formatLabel } from "../utils/status";

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/complaints/${id}`)
      .then(({ data }) => {
        setComplaint(data.complaint);
        setLogs(data.logs);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load complaint");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader label="Loading complaint..." />;
  if (error)
    return <p className="mx-auto max-w-2xl rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;

  const statusMeta = STATUS_META[complaint.status] || {};
  const priorityMeta = PRIORITY_META[complaint.priority] || {};

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link to="/my-complaints" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← Back to my complaints
      </Link>

      <Card className="space-y-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold capitalize text-slate-800">
              {formatLabel(complaint.category)}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Submitted {new Date(complaint.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge tone={priorityMeta.tone}>{priorityMeta.label} priority</Badge>
          </div>
        </div>

        <StatusTracker currentStatus={complaint.status} />

        <p className="text-sm text-slate-600">{complaint.description}</p>

        {complaint.imageUrl && (
          <img src={complaint.imageUrl} alt="complaint" className="w-full rounded-xl object-cover" />
        )}

        {complaint.assignedWorkerId && (
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Assigned worker: <span className="font-medium">{complaint.assignedWorkerId.name}</span> (
            {complaint.assignedWorkerId.phone})
          </div>
        )}

        {complaint.resolvedImageUrl && (
          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">Proof of resolution</p>
            <img src={complaint.resolvedImageUrl} alt="resolution proof" className="w-full rounded-xl object-cover" />
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold text-slate-800">Status history</h3>
        <ul className="space-y-2">
          {logs.map((log) => (
            <li key={log._id} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              <span className="capitalize">{formatLabel(log.oldStatus) || "—"}</span>
              <span className="text-slate-400">→</span>
              <span className="font-medium capitalize text-slate-800">{formatLabel(log.newStatus)}</span>
              <span className="ml-auto text-xs text-slate-400">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default ComplaintDetailPage;
