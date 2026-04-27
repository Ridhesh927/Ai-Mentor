import { useEffect, useState } from "react";
import { callApi } from "../utils/api";

function UsersPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const currentAdmin = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = currentAdmin?.role === "superadmin";

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const [usersResult, adminsResult] = await Promise.allSettled([
        callApi("/admin/users"),
        callApi("/admin/admins"),
      ]);

      const usersList = usersResult.status === "fulfilled"
        ? (Array.isArray(usersResult.value?.data) ? usersResult.value.data : [])
        : [];
      const adminsList = adminsResult.status === "fulfilled"
        ? (Array.isArray(adminsResult.value?.data) ? adminsResult.value.data : [])
        : [];

      if (usersResult.status === "rejected" && adminsResult.status === "rejected") {
        throw new Error(usersResult.reason?.message || adminsResult.reason?.message || "Unable to load accounts");
      }

      const normalizedUsers = usersList.map((user) => ({
        id: `user-${user.id}`,
        rawId: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        type: "user",
        createdAt: user.createdAt,
      }));

      const normalizedAdmins = adminsList.map((admin) => ({
        id: `admin-${admin.id}`,
        rawId: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role || "admin",
        type: "admin",
        createdAt: admin.createdAt,
      }));

      const merged = [...normalizedAdmins, ...normalizedUsers].sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

      setAccounts(merged);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onCreateAdmin = async (event) => {
    event.preventDefault();
    setSubmitError(null);

    if (!isSuperAdmin) {
      setSubmitError("Only superadmin can add other admins.");
      return;
    }

    try {
      setIsSubmitting(true);
      await callApi("/admin/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      setFormData({ name: "", email: "", password: "" });
      setIsAddAdminOpen(false);
      await fetchAccounts();
    } catch (err) {
      setSubmitError(err.message || "Unable to create admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleAccounts = activeFilter
    ? accounts.filter((item) => item.type === activeFilter)
    : accounts;

  if (loading) return <div className="p-10 text-center text-muted">Loading users...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-semibold">All Accounts</h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter((prev) => (prev === "admin" ? null : "admin"))}
            className={`h-10 px-4 rounded-lg border transition-colors ${
              activeFilter === "admin"
                ? "border-primary bg-primary/20 text-white"
                : "border-border hover:bg-canvas-alt"
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter((prev) => (prev === "user" ? null : "user"))}
            className={`h-10 px-4 rounded-lg border transition-colors ${
              activeFilter === "user"
                ? "border-primary bg-primary/20 text-white"
                : "border-border hover:bg-canvas-alt"
            }`}
          >
            User
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsAddAdminOpen(true)}
            disabled={!isSuperAdmin}
            className="h-10 px-4 rounded-xl text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            title={isSuperAdmin ? "Create a new admin" : "Only superadmin can add admins"}
          >
            + Add Admin
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[225px]">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-border">
              <th className="p-5">Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Role</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {visibleAccounts.length > 0 ? (
              visibleAccounts.map((account) => (
                <tr key={account.id} className="border-b border-border hover:bg-canvas-alt transition-colors">
                  <td className="p-5 font-medium">{account.name}</td>
                  <td>{account.email}</td>
                  <td>
                    <span className={`inline-flex h-7 items-center px-3 rounded-lg border capitalize ${
                      account.type === "admin"
                        ? "border-primary/60 text-primary"
                        : "border-border text-muted"
                    }`}>
                      {account.type}
                    </span>
                  </td>
                  <td className="capitalize">{account.role}</td>
                  <td>{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "-"}</td>
                  <td className="text-green-600">Active</td>
                  <td className="text-lg cursor-pointer hover:text-primary">...</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-10 text-center text-muted italic">No accounts found for selected filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddAdminOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6">
            <h3 className="text-2xl font-semibold mb-4">Create Admin</h3>

            <form className="space-y-4" onSubmit={onCreateAdmin}>
              <div>
                <label className="block text-sm text-muted mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onFieldChange}
                  required
                  className="w-full rounded-xl bg-canvas-alt border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onFieldChange}
                  required
                  className="w-full rounded-xl bg-canvas-alt border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={onFieldChange}
                  required
                  minLength={6}
                  className="w-full rounded-xl bg-canvas-alt border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <p className="text-xs text-muted">This will create a regular admin account only.</p>

              {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddAdminOpen(false);
                    setSubmitError(null);
                  }}
                  className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-4 rounded-xl text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default UsersPage;

