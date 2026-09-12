import { useEffect, useState } from "react";
import api from "../services/api";
import ComplaintTable from "../components/admin/ComplaintTable";
import AssignWorkerModal from "../components/admin/AssignWorkerModal";
import AnalyticsCharts from "../components/admin/AnalyticsCharts";
import AddWorkerForm from "../components/admin/AddWorkerForm";
import WorkersTable from "../components/admin/WorkersTable";
import EditWorkerModal from "../components/admin/EditWorkerModal";
import MapView from "../components/shared/MapView";
import Card from "../components/ui/Card";
import PageLoader from "../components/ui/PageLoader";
import Spinner from "../components/ui/Spinner";
import { Select, Input } from "../components/ui/Field";

const statCardsConfig = [
  { key: "total", label: "Total complaints", tone: "text-slate-800" },
  { key: "resolvedCount", label: "Resolved", tone: "text-emerald-600" },
  { key: "pending", label: "Pending", tone: "text-amber-600" },
  { key: "highPriority", label: "High priority", tone: "text-red-600" },
];

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [analytics, setAnalytics] = useState({ byStatus: [], byCategory: [], byDate: [] });
  const [modalComplaint, setModalComplaint] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [areaInput, setAreaInput] = useState("");
  const [searchCenter, setSearchCenter] = useState(null);
  const [radiusKm, setRadiusKm] = useState(2);
  const [pickingLocation, setPickingLocation] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (areaFilter) params.area = areaFilter;
      if (searchCenter) {
        params.nearLat = searchCenter.lat;
        params.nearLng = searchCenter.lng;
        params.radiusKm = radiusKm;
      }
      const [{ data: complaintsData }, { data: workersData }, { data: analyticsData }] = await Promise.all([
        api.get("/admin/complaints", { params }),
        api.get("/admin/workers"),
        api.get("/admin/analytics"),
      ]);
      setComplaints(complaintsData);
      setWorkers(workersData);
      setAnalytics(analyticsData);
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, areaFilter, searchCenter, radiusKm]);

  const handleMapClick = (latlng) => {
    if (!pickingLocation) return;
    setSearchCenter(latlng);
    setPickingLocation(false);
  };

  const handleAssign = async (complaintId, workerId) => {
    await api.post(`/admin/complaints/${complaintId}/assign`, { workerId });
    setModalComplaint(null);
    loadData();
  };

  const handleStatusChange = async (complaintId, status) => {
    await api.post(`/admin/complaints/${complaintId}/status`, { status });
    loadData();
  };

  const handleSaveWorker = async (workerId, form) => {
    await api.post(`/admin/workers/${workerId}`, form);
    setEditingWorker(null);
    loadData();
  };

  const handleToggleWorkerActive = async (worker) => {
    await api.post(`/admin/workers/${worker._id}/status`, { isActive: !worker.isActive });
    loadData();
  };

  const handleDeleteWorker = async (worker) => {
    if (!window.confirm(`Delete worker "${worker.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/workers/${worker._id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete worker");
    }
  };

  if (initialLoading) return <PageLoader label="Loading dashboard..." />;

  const pendingCount = analytics.byStatus.find((s) => s._id === "pending")?.count ?? 0;
  const highPriorityCount = complaints.filter((c) => c.priority === "high").length;
  const stats = { ...analytics, pending: pendingCount, highPriority: highPriorityCount };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Admin dashboard</h2>
        {refreshing && <Spinner size="sm" />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCardsConfig.map((s) => (
          <Card key={s.key} className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className={`mt-2 text-2xl font-bold ${s.tone}`}>{stats[s.key] ?? "—"}</p>
          </Card>
        ))}
      </div>

      <AnalyticsCharts byStatus={analytics.byStatus} byCategory={analytics.byCategory} byDate={analytics.byDate} />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">Complaint map</h3>
        <p className="text-sm text-slate-500">
          Click a row in the table below to locate it on the map, or click a marker to highlight its row.
        </p>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <button
            type="button"
            onClick={() => setPickingLocation((v) => !v)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              pickingLocation
                ? "bg-red-600 text-white"
                : "border border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {pickingLocation ? "Click the map to set center…" : "Search near a location"}
          </button>
          {searchCenter && (
            <>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Radius
                <Select value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} className="!w-auto py-1">
                  {[1, 2, 5, 10, 20].map((km) => (
                    <option key={km} value={km}>
                      {km} km
                    </option>
                  ))}
                </Select>
              </label>
              <button
                type="button"
                onClick={() => setSearchCenter(null)}
                className="text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Clear
              </button>
            </>
          )}
          {!searchCenter && !pickingLocation && (
            <span className="text-sm text-slate-400">
              Complaints only store a map pin (lat/lng), not a street address — use this to search by distance instead.
            </span>
          )}
        </div>

        <Card padded={false} className="overflow-hidden">
          <MapView
            complaints={complaints}
            selectedId={selectedId}
            onSelectComplaint={setSelectedId}
            searchCenter={searchCenter}
            radiusKm={radiusKm}
            onMapClick={pickingLocation ? handleMapClick : undefined}
          />
        </Card>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">Workers</h3>
        <Card>
          <AddWorkerForm onCreated={loadData} />
        </Card>
        <WorkersTable
          workers={workers}
          onEdit={setEditingWorker}
          onToggleActive={handleToggleWorkerActive}
          onDelete={handleDeleteWorker}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">All complaints</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
            </Select>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAreaFilter(areaInput);
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Address contains (if provided)"
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              className="w-56"
            />
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Search
            </button>
          </form>
          {searchCenter && (
            <span className="text-sm text-slate-500">
              Showing complaints within {radiusKm} km of the selected point
              {complaints[0]?.distanceKm !== undefined && ` (${complaints.length} found)`}
            </span>
          )}
        </div>

        <ComplaintTable
          complaints={complaints}
          onAssignClick={setModalComplaint}
          onStatusChange={handleStatusChange}
          selectedId={selectedId}
          onSelectComplaint={setSelectedId}
        />
      </section>

      <AssignWorkerModal
        complaint={modalComplaint}
        workers={workers.filter((w) => w.isActive)}
        onClose={() => setModalComplaint(null)}
        onAssign={handleAssign}
      />

      <EditWorkerModal
        worker={editingWorker}
        onClose={() => setEditingWorker(null)}
        onSave={handleSaveWorker}
      />
    </div>
  );
};

export default AdminDashboard;
