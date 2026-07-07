import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Field, Select } from "../ui/Field";
import { formatLabel } from "../../utils/status";

const AssignWorkerModal = ({ complaint, workers, onClose, onAssign }) => {
  const [workerId, setWorkerId] = useState(workers[0]?._id || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWorkerId(workers[0]?._id || "");
  }, [complaint, workers]);

  if (!complaint) return null;

  const handleAssign = async () => {
    setSaving(true);
    try {
      await onAssign(complaint._id, workerId);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!complaint}
      onClose={onClose}
      title="Assign worker"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} loading={saving} disabled={!workerId}>
            Assign
          </Button>
        </>
      }
    >
      <p className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
        <span className="font-medium capitalize">{formatLabel(complaint.category)}</span> —{" "}
        {complaint.description}
      </p>

      <Field label="Worker">
        {workers.length === 0 ? (
          <p className="text-sm text-slate-400">No workers available. Add one first.</p>
        ) : (
          <Select value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
            {workers.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name} ({w.zoneAssigned}) — {w.activeTaskCount} active
              </option>
            ))}
          </Select>
        )}
      </Field>
    </Modal>
  );
};

export default AssignWorkerModal;
