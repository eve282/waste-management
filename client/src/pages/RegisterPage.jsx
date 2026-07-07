import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";

const fields = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "text", required: true },
  { name: "password", label: "Password", type: "password", required: true },
  { name: "address", label: "Address (optional)", type: "text", required: false },
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", address: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/submit");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <Card className="space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800">Create a citizen account</h2>
          <p className="mt-1 text-sm text-slate-500">Report issues and track their resolution</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <Field key={f.name} label={f.label}>
              <Input
                name={f.name}
                type={f.type}
                value={form[f.name]}
                onChange={handleChange}
                required={f.required}
              />
            </Field>
          ))}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <Button type="submit" loading={submitting} className="w-full">
            Register
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
