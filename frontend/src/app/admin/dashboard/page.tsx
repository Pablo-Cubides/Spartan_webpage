
export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stat Card 1 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium uppercase">Total Users</h3>
          <p className="text-3xl font-bold text-white mt-2">1,234</p>
          <span className="text-green-500 text-sm font-medium mt-2 inline-block">+12% from last month</span>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium uppercase">Active Credits</h3>
          <p className="text-3xl font-bold text-white mt-2">45,678</p>
          <span className="text-blue-500 text-sm font-medium mt-2 inline-block">System Total</span>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium uppercase">Revenue (Mo)</h3>
          <p className="text-3xl font-bold text-white mt-2">$12,345</p>
          <span className="text-green-500 text-sm font-medium mt-2 inline-block">+5% from last month</span>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium uppercase">System Status</h3>
          <p className="text-3xl font-bold text-green-500 mt-2">Healthy</p>
          <span className="text-gray-500 text-sm font-medium mt-2 inline-block">All systems operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-700 pb-2 last:border-0">
                <div>
                  <p className="text-white font-medium">New User Registration</p>
                  <p className="text-gray-400 text-sm">user_{i}@example.com joined</p>
                </div>
                <span className="text-gray-500 text-sm">2m ago</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium transition">
              Create Announcement
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-medium transition">
              Write Blog Post
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-medium transition">
              Manage Credits
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg font-medium transition">
              System Maintenance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
