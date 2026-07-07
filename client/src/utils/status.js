export const formatLabel = (value) => (value ? value.replace(/_/g, " ") : "");

export const STATUS_STEPS = ["pending", "assigned", "in_progress", "resolved"];

export const STATUS_META = {
  pending: { label: "Pending", tone: "amber", hex: "#d97706" },
  assigned: { label: "Assigned", tone: "blue", hex: "#2563eb" },
  in_progress: { label: "In progress", tone: "violet", hex: "#7c3aed" },
  resolved: { label: "Resolved", tone: "green", hex: "#059669" },
};

export const PRIORITY_META = {
  low: { label: "Low", tone: "gray", hex: "#64748b" },
  medium: { label: "Medium", tone: "orange", hex: "#ea580c" },
  high: { label: "High", tone: "red", hex: "#dc2626" },
};
