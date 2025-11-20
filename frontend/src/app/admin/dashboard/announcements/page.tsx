
"use client";

import { useState } from "react";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Maintenance Scheduled", message: "System update on Sunday.", active: true, type: "warning" },
    { id: 2, title: "New Feature Released", message: "Try the new Style Advisor!", active: false, type: "info" },
  ]);

  const toggleActive = (id: number) => {
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Announcements</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
          + New Announcement
        </button>
      </div>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-white">{announcement.title}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                  announcement.type === 'warning' ? 'bg-yellow-900 text-yellow-200' : 'bg-blue-900 text-blue-200'
                }`}>
                  {announcement.type}
                </span>
              </div>
              <p className="text-gray-400">{announcement.message}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcement.active}
                  onChange={() => toggleActive(announcement.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
              <button className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
