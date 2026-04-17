import { useEffect, useState } from "react";

function ComplaintsPage({ api, searchQuery, refreshKey, triggerRefresh }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        search: searchQuery || "",
        status: statusFilter,
        limit: "200",
      });
      const response = await api(`/complaints?${query.toString()}`);
      setRows(response?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [searchQuery, statusFilter, refreshKey]);

  const updateStatus = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      await api(`/complaints/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      await load();
      triggerRefresh();
    } catch (err) {
      setError(err.message || "Failed to update complaint");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Complaints</h2>
        <select
          className="h-10 px-3 rounded-xl border border-border bg-canvas-alt text-sm"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">All Status</option>
          <option value="open">open</option>
          <option value="in_progress">in_progress</option>
          <option value="resolved">resolved</option>
          <option value="closed">closed</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Loading complaints...</p>
      ) : (
        <div className="space-y-3">
          {rows.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{item.subject}</h3>
                  <p className="text-xs text-muted">
                    {item.user?.name || "Unknown user"} ({item.user?.email || "-"}) • {item.priority}
                  </p>
                </div>
                <div className="text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
              <p className="mt-3 text-sm">{item.message}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-muted">Status: {item.status}</span>
                <select
                  className="h-8 px-2 rounded-lg border border-border bg-canvas-alt text-xs"
                  value={item.status}
                  disabled={busyId === item.id}
                  onChange={(event) => updateStatus(item.id, event.target.value)}
                >
                  <option value="open">open</option>
                  <option value="in_progress">in_progress</option>
                  <option value="resolved">resolved</option>
                  <option value="closed">closed</option>
                </select>
              </div>
            </article>
          ))}
          {!rows.length && <p className="text-sm text-muted">No complaints found.</p>}
        </div>
      )}
    </div>
  );
}

export default ComplaintsPage;
