import { useState } from "react";
import api from "../../services/api";
import Button from "../ui/Button";
import { Field, Input } from "../ui/Field";

const emptyForm = { name: "", email: "", phone: "", password: "", zoneAssigned: "" };

const AddWorkerForm = ({ onCreated }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/admin/workers", form);
      setForm(emptyForm);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create worker");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Name">
          <Input name="name" value={form.name} onChange={handleChange} required />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" value={form.email} onChange={handleChange} required />
        </Field>
        <Field label="Phone">
          <Input name="phone" value={form.phone} onChange={handleChange} required />
        </Field>
        <Field label="Password">
          <Input name="password" type="password" value={form.password} onChange={handleChange} required />
        </Field>
        <Field label="Zone">
          <Input name="zoneAssigned" value={form.zoneAssigned} onChange={handleChange} required />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving} size="sm">
          Add worker
        </Button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
};

export default AddWorkerForm;
