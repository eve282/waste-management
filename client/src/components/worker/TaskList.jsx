import { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import PageLoader from "../ui/PageLoader";
import { STATUS_META, PRIORITY_META, formatLabel } from "../../utils/status";
import { validateImageSize, MAX_IMAGE_SIZE_MB } from "../../utils/upload";

const TaskList = () => {
  const [activeTasks, setActiveTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [proofImages, setProofImages] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [taskErrors, setTaskErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const loadTasks = async () => {
    const { data } = await api.get("/worker/tasks");
    setActiveTasks(data.active);
    setCompletedTasks(data.completed);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleProofImageChange = (taskId, e) => {
    const file = e.target.files[0];
    const error = validateImageSize(file);
    if (error) {
      setImageErrors((prev) => ({ ...prev, [taskId]: error }));
      setProofImages((prev) => ({ ...prev, [taskId]: null }));
      e.target.value = "";
      return;
    }
    setImageErrors((prev) => ({ ...prev, [taskId]: "" }));
    setProofImages((prev) => ({ ...prev, [taskId]: file }));
  };

  const handleStart = async (taskId) => {
    setActioningId(taskId);
    setTaskErrors((prev) => ({ ...prev, [taskId]: "" }));
    try {
      await api.post(`/worker/tasks/${taskId}/start`);
      await loadTasks();
    } catch (err) {
      setTaskErrors((prev) => ({ ...prev, [taskId]: err.response?.data?.message || "Failed to start task." }));
    } finally {
      setActioningId(null);
    }
  };

  const handleResolve = async (taskId) => {
    setActioningId(taskId);
    setTaskErrors((prev) => ({ ...prev, [taskId]: "" }));
    try {
      const formData = new FormData();
      if (proofImages[taskId]) formData.append("image", proofImages[taskId]);
      await api.post(`/worker/tasks/${taskId}/resolve`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await loadTasks();
    } catch (err) {
      setTaskErrors((prev) => ({ ...prev, [taskId]: err.response?.data?.message || "Failed to resolve task." }));
    } finally {
      setActioningId(null);
    }
  };

  if (loading) return <PageLoader label="Loading your tasks..." />;

  const renderActiveTask = (task) => {
    const statusMeta = STATUS_META[task.status] || {};
    const priorityMeta = PRIORITY_META[task.priority] || {};
    const busy = actioningId === task._id;

    return (
      <Card key={task._id} className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold capitalize text-slate-800">{formatLabel(task.category)}</h3>
          <div className="flex gap-2">
            <Badge tone={priorityMeta.tone}>{priorityMeta.label}</Badge>
            <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
          </div>
        </div>

        <p className="text-sm text-slate-600">{task.description}</p>

        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Citizen: <span className="font-medium">{task.userId?.name}</span> ({task.userId?.phone})
          <br />
          Address: {task.address || "N/A"}
        </div>

        {task.imageUrl && (
          <img src={task.imageUrl} alt="complaint" className="h-40 w-full rounded-lg object-cover" />
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${task.location.lat},${task.location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            View location
          </a>
          {task.status === "assigned" && (
            <Button size="sm" loading={busy} onClick={() => handleStart(task._id)}>
              Start progress
            </Button>
          )}
          {task.status === "in_progress" && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleProofImageChange(task._id, e)}
                className="text-sm text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-brand-50 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-brand-700 hover:file:bg-brand-100"
              />
              <Button size="sm" loading={busy} onClick={() => handleResolve(task._id)}>
                Mark resolved
              </Button>
            </>
          )}
        </div>

        {task.status === "in_progress" && (
          <p className="text-xs text-slate-400">Proof photo optional, max {MAX_IMAGE_SIZE_MB}MB</p>
        )}
        {imageErrors[task._id] && <p className="text-sm text-red-600">{imageErrors[task._id]}</p>}
        {taskErrors[task._id] && <p className="text-sm text-red-600">{taskErrors[task._id]}</p>}
      </Card>
    );
  };

  const renderCompletedTask = (task) => {
    const priorityMeta = PRIORITY_META[task.priority] || {};

    return (
      <Card key={task._id} className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold capitalize text-slate-800">{formatLabel(task.category)}</h3>
          <div className="flex gap-2">
            <Badge tone={priorityMeta.tone}>{priorityMeta.label}</Badge>
            <Badge tone="green">Resolved</Badge>
          </div>
        </div>

        <p className="text-sm text-slate-600">{task.description}</p>

        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Citizen: <span className="font-medium">{task.userId?.name}</span> ({task.userId?.phone})
          <br />
          Resolved: {task.resolvedAt ? new Date(task.resolvedAt).toLocaleString() : "N/A"}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {task.imageUrl && (
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Reported photo</p>
              <img src={task.imageUrl} alt="complaint" className="h-32 w-full rounded-lg object-cover" />
            </div>
          )}
          {task.resolvedImageUrl && (
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Proof of resolution</p>
              <img src={task.resolvedImageUrl} alt="resolution proof" className="h-32 w-full rounded-lg object-cover" />
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="mb-6 text-xl font-semibold text-slate-800">My assigned tasks</h2>
        {activeTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
            No active tasks right now.
          </div>
        ) : (
          <div className="space-y-4">{activeTasks.map(renderActiveTask)}</div>
        )}
      </div>

      <div>
        <h2 className="mb-6 text-xl font-semibold text-slate-800">Completed tasks</h2>
        {completedTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
            No completed tasks yet.
          </div>
        ) : (
          <div className="space-y-4">{completedTasks.map(renderCompletedTask)}</div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
