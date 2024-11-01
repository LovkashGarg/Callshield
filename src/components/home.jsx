import React from "react";
import { FiPhone, FiUser, FiStar, FiSettings } from "react-icons/fi";

const CallAppHome = () => {
  const recentCalls = [
    { name: "John Doe", time: "Today, 3:45 PM" },
    { name: "Jane Smith", time: "Yesterday, 1:15 PM" },
    { name: "Sam Wilson", time: "Yesterday, 11:30 AM" },
    // Add more entries as needed
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="p-4 bg-white shadow-md">
        <h1 className="text-2xl font-semibold">Call App</h1>
      </header>

      {/* Search Bar */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search contacts"
          className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Recent Calls */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Calls</h2>
        <ul>
          {recentCalls.map((call, index) => (
            <li
              key={index}
              className="flex items-center p-3 mb-2 bg-white rounded-lg shadow-md"
            >
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {call.name[0]}
              </div>
              <div className="ml-3">
                <p className="text-md font-medium">{call.name}</p>
                <p className="text-sm text-gray-500">{call.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Navigation */}
      <nav className="flex items-center justify-around p-4 bg-white border-t border-gray-300">
        <button className="flex flex-col items-center text-blue-500">
          <FiPhone size={24} />
          <span className="text-sm">Calls</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <FiUser size={24} />
          <span className="text-sm">Contacts</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <FiStar size={24} />
          <span className="text-sm">Favorites</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <FiSettings size={24} />
          <span className="text-sm">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default CallAppHome;
