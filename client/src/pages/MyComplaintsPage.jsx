import { useEffect, useState } from "react";
import api from "../services/api";
import ComplaintCard from "../components/citizen/ComplaintCard";
import PageLoader from "../components/ui/PageLoader";

const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/complaints/my").then(({ data }) => {
      setComplaints(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageLoader label="Loading your complaints..." />;

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-6 text-xl font-semibold text-slate-800">My complaints</h2>

      {complaints.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
          No complaints submitted yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {complaints.map((c) => (
            <ComplaintCard key={c._id} complaint={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaintsPage;
