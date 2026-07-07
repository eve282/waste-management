import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleHome = { citizen: "/submit", admin: "/admin", worker: "/worker" };

const features = [
  {
    icon: "📍",
    title: "Pin the exact spot",
    text: "Drop a map pin so collection teams know precisely where the issue is.",
  },
  {
    icon: "📸",
    title: "Attach photo proof",
    text: "Upload a photo when you report, and workers upload proof when resolved.",
  },
  {
    icon: "🔔",
    title: "Stay notified",
    text: "Get an email the moment your complaint is assigned, progressed, or resolved.",
  },
];

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-16 text-center text-white shadow-lg sm:px-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Smart Waste Management System</h1>
        <p className="mx-auto mt-4 max-w-xl text-brand-50">
          Report waste issues, track resolution in real time, and help keep your neighborhood clean.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          {user ? (
            <Link
              to={roleHome[user.role] || "/"}
              className="rounded-lg bg-white px-5 py-2.5 font-medium text-brand-700 shadow-sm hover:bg-brand-50"
            >
              Go to my dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-lg bg-white px-5 py-2.5 font-medium text-brand-700 shadow-sm hover:bg-brand-50"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-white/40 px-5 py-2.5 font-medium text-white hover:bg-white/10"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-2 font-semibold text-slate-800">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
