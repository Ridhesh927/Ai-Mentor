import { useMemo, useState } from "react";
import AdminHeader from "./components/layout/AdminHeader";
import AdminSidebar from "./components/layout/AdminSidebar";
import { PAGE_TITLES } from "./constants/adminNavigation";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import EnrollmentsPage from "./pages/EnrollmentsPage";
import PaymentsPage from "./pages/PaymentsPage";
import UsersPage from "./pages/UsersPage";

const PAGE_COMPONENTS = {
  dashboard: DashboardPage,
  courses: CoursesPage,
  users: UsersPage,
  enrollments: EnrollmentsPage,
  payments: PaymentsPage,
};

function App() {
  const [page, setPage] = useState("courses");

  const title = useMemo(() => PAGE_TITLES[page] ?? PAGE_TITLES.dashboard, [page]);
  const CurrentPage = PAGE_COMPONENTS[page] ?? DashboardPage;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]" style={{ backgroundColor: "var(--admin-bg)" }}>
      <AdminSidebar page={page} onPageChange={setPage} />

      <main className="flex flex-col min-h-screen">
        <AdminHeader title={title} />

        <section className="p-4 md:p-8">
          <div className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: "var(--neutral-100)", boxShadow: "0 2px 8px rgba(26,26,26,0.06)" }}>
            <CurrentPage />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;