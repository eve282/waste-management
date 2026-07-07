import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Field, Input } from "../ui/Field";

const emptyForm = { name: "", email: "", phone: "", zoneAssigned: "" };

const EditWorkerModal = ({ worker, onClose, onSave }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (worker) {
      setForm({
        name: worker.name || "",
        email: worker.userId?.email || "",
        phone: worker.phone || "",
        zoneAssigned: worker.zoneAssigned || "",
      });
      setError("");
    }
  }, [worker]);

  if (!worker) return null;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave(worker._id, form);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update worker");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!worker}
      onClose={onClose}
      title="Edit worker"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Name">
          <Input name="name" value={form.name} onChange={handleChange} required />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" value={form.email} onChange={handleChange} required />
        </Field>
        <Field label="Phone">
          <Input name="phone" value={form.phone} onChange={handleChange} required />
        </Field>
        <Field label="Zone">
          <Input name="zoneAssigned" value={form.zoneAssigned} onChange={handleChange} required />
        </Field>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>
    </Modal>
  );
};

export default EditWorkerModal;
