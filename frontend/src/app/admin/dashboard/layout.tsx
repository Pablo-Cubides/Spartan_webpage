
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Spartan Edge",
  description: "Administrative control panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-500">Spartan Admin</h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <a href="/admin/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
            Dashboard
          </a>
          <a href="/admin/dashboard/settings" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
            Settings & Costs
          </a>
          <a href="/admin/dashboard/users" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
            Users & Roles
          </a>
          <a href="/admin/dashboard/blog" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
            Blog Posts
          </a>
          <a href="/admin/dashboard/announcements" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
            Announcements
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
