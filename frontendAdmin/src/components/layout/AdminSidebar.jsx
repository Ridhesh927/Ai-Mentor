import { NAV_ITEMS } from "../../constants/adminNavigation";

function AdminSidebar({ page, onPageChange }) {
  return (
    <aside className="text-white flex flex-col" style={{ backgroundColor: "var(--admin-sidebar)" }}>
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: "var(--admin-primary)" }}>
            S
          </div>
          <div>
            <p className="font-semibold text-xl leading-5">UptoSkills</p>
            <p className="text-xs text-white/70">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {NAV_ITEMS.map(([id, label]) => {
          const active = page === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onPageChange(id)}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition ${active ? "text-white" : "hover:bg-white/10"}`}
              style={active ? { backgroundColor: "var(--admin-primary)" } : undefined}
            >
              {label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 p-4 space-y-3">
        <button type="button" className="w-full text-left px-4 py-3 rounded-xl font-medium hover:bg-white/10 transition">
          Settings
        </button>
        <div className="px-4 py-3 rounded-xl bg-white/5 flex items-center justify-between">
          <div>
            <p className="font-semibold">Admin</p>
            <p className="text-xs text-white/70">Super Admin</p>
          </div>
          <span className="h-8 w-8 rounded-full text-slate-900 font-bold flex items-center justify-center" style={{ backgroundColor: "var(--brand-orange)" }}>
            A
          </span>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;