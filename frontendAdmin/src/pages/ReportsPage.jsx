import { useEffect, useState } from "react";
import { callApi } from "../utils/api";

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await callApi("/admin/reports");
        const reportsList = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        setReports(reportsList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="p-10 text-center text-muted">Loading reports...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold">User Reports</h2>
        <div className="flex gap-2">
          <button type="button" className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors">Filter</button>
          <button type="button" className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors">Export</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-border">
              <th className="p-5">Reporter</th>
              <th>Reported Content</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Reported At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {reports.length > 0 ? (
              reports.map((report) => (
                <tr key={report.id} className="border-b border-border hover:bg-canvas-alt transition-colors">
                  <td className="p-5">
                    <div className="font-semibold">{report.reporter?.name || "Unknown"}</div>
                    <div className="text-muted text-xs">{report.reporter?.email}</div>
                  </td>
                  <td className="max-w-xs">
                    <div className="truncate font-medium">{report.post?.content || "N/A"}</div>
                    <div className="text-muted text-[10px]">Author: {report.post?.author?.name || "Unknown"}</div>
                  </td>
                  <td>
                    <span className="px-2 py-1 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold uppercase">
                      {report.reason}
                    </span>
                    {report.description && (
                      <div className="text-xs text-muted mt-1 italic">"{report.description}"</div>
                    )}
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      report.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="text-muted whitespace-nowrap">
                    {new Date(report.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <button className="text-teal-500 hover:underline font-semibold">View Details</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-10 text-center text-muted italic">No reports found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ReportsPage;
