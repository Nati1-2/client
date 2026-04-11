import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">UniEvents — My events</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">Hi, {user?.name}</span>
            <Link to="/" className="text-sm text-blue-600 hover:underline">
              Home
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-gray-700">
          You are signed in as a student. Your registered events can be listed here later.
        </p>
      </main>
    </div>
  );
}
