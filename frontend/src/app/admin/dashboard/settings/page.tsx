
"use client";

import { useState, useEffect } from "react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    creditCostAnalysis: 1,
    creditCostGeneration: 1,
    appEnabled: true,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch current settings
    // fetch('/api/admin/settings').then(res => res.json()).then(data => setSettings(data));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      // await fetch('/api/admin/settings', { method: 'POST', body: JSON.stringify(settings) });
      setMessage("Settings saved successfully!");
    } catch {
      setMessage("Error saving settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">System Settings</h2>

      {message && (
        <div className={`p-4 mb-6 rounded ${message.includes("Error") ? "bg-red-900/50 text-red-200" : "bg-green-900/50 text-green-200"}`}>
          {message}
        </div>
      )}

      <div className="space-y-8">
        {/* Credit Costs Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-blue-400">Credit System Costs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Cost per Analysis</label>
              <input
                type="number"
                value={settings.creditCostAnalysis}
                onChange={(e) => setSettings({ ...settings, creditCostAnalysis: parseInt(e.target.value) })}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Credits deducted for each face analysis.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Cost per Generation</label>
              <input
                type="number"
                value={settings.creditCostGeneration}
                onChange={(e) => setSettings({ ...settings, creditCostGeneration: parseInt(e.target.value) })}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Credits deducted for each AI image generation.</p>
            </div>
          </div>
        </div>

        {/* App Status Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-red-400">Application Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Enable Asesor de Estilo</h4>
                <p className="text-sm text-gray-400">Turn off to disable the feature for all users.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.appEnabled}
                  onChange={(e) => setSettings({ ...settings, appEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="border-t border-gray-700 pt-4 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Maintenance Mode</h4>
                <p className="text-sm text-gray-400">Show maintenance page to all non-admin users.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
