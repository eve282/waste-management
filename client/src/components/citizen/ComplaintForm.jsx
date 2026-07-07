import { useState } from "react";
import api from "../../services/api";
import MapPicker from "../shared/MapPicker";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Field, Input, Textarea, Select } from "../ui/Field";
import { validateImageSize, MAX_IMAGE_SIZE_MB } from "../../utils/upload";

const categories = [
  { value: "garbage_overflow", label: "Garbage overflow" },
  { value: "missed_pickup", label: "Missed pickup" },
  { value: "illegal_dumping", label: "Illegal dumping" },
  { value: "other", label: "Other" },
];

const ComplaintForm = () => {
  const [category, setCategory] = useState(categories[0].value);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("success");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const error = validateImageSize(file);
    if (error) {
      setImageError(error);
      setImage(null);
      e.target.value = "";
      return;
    }
    setImageError("");
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!location) {
      setMessage("Please select a location on the map.");
      setMessageTone("error");
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    formData.append("lat", location.lat);
    formData.append("lng", location.lng);
    formData.append("address", address);
    if (image) formData.append("image", image);

    setSubmitting(true);
    try {
      await api.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Complaint submitted successfully.");
      setMessageTone("success");
      setDescription("");
      setImage(null);
      setImageError("");
      setLocation(null);
      setAddress("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit complaint.");
      setMessageTone("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Submit a complaint</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tell us what's wrong and pin the location so a worker can find it quickly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Address (optional)">
              <Input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
          </div>

          <Field label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </Field>

          <Field label={`Photo (optional, max ${MAX_IMAGE_SIZE_MB}MB)`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
            />
            {imageError && <p className="mt-1 text-sm text-red-600">{imageError}</p>}
          </Field>

          <Field label="Location">
            <MapPicker onLocationChange={setLocation} />
          </Field>

          <Button type="submit" loading={submitting} className="w-full">
            Submit complaint
          </Button>

          {message && (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                messageTone === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </Card>
    </div>
  );
};

export default ComplaintForm;
