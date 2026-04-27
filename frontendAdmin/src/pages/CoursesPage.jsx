import { useEffect, useState } from "react";
import { callApi } from "../utils/api";

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await callApi("/admin/courses");
        const coursesList = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        setCourses(coursesList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="p-10 text-center text-muted">Loading courses...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Active Courses</h2>
        <div className="flex gap-2">
          <button type="button" className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors">Filter</button>
          <button type="button" className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors">Export</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[225px]">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-border">
              <th className="p-5">Course Detail</th>
              <th>Category</th>
              <th>Pricing</th>
              <th>Enrolled</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {courses.length > 0 ? (
              courses.map((course) => (
                <tr key={course.id} className="border-b border-border hover:bg-canvas-alt transition-colors">
                  <td className="p-5">
                    <div className="font-semibold">{course.title}</div>
                    <div className="text-muted">Updated: {new Date(course.updatedAt).toLocaleDateString()}</div>
                  </td>
                  <td><span className="px-3 py-1 rounded-full bg-canvas-alt border border-border">{course.category}</span></td>
                  <td className="font-semibold">{course.price || `Rs ${course.priceValue || 0}`}</td>
                  <td>{course.studentsCount || 0}</td>
                  <td className="text-green-600">Published</td>
                  <td className="text-lg cursor-pointer hover:text-primary">...</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-10 text-center text-muted italic">No courses found. Seed data to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default CoursesPage;

