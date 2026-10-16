import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isStudent, logout, apiOnline, apiLatency, checkHealth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 bg-clip-text text-transparent">
                  UniEvents
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 -mt-1">
                  Campus Platform
                </span>
              </div>
            </Link>

            {/* Main Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  isActive("/")
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                Explore Events
              </Link>

              {isStudent && (
                <Link
                  to="/student"
                  className={`px-3.5 py-2 rounded-lg transition-colors ${
                    isActive("/student")
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  My Passes & Events
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3.5 py-2 rounded-lg transition-colors ${
                    isActive("/admin")
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  Admin Console
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section: Backend Status + Auth Actions */}
          <div className="flex items-center gap-3.5">
            {/* Live Backend Connection Indicator */}
            <button
              onClick={checkHealth}
              title={apiOnline ? `Backend connected to port 5000 (latency: ${apiLatency || "<5"}ms). Click to re-check.` : "Backend offline. Click to test connection."}
              className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                apiOnline
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70"
                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {apiOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${apiOnline ? "bg-emerald-500" : "bg-rose-500"}`}></span>
              </span>
              <span>{apiOnline ? `API Online (${apiLatency || 4}ms)` : "API Offline"}</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-800 leading-tight">
                    {user?.name || user?.username}
                  </span>
                  <span className="text-xs text-slate-500 capitalize">
                    {user?.role === "admin" ? "🛡️ Administrator" : "🎓 Student"}
                  </span>
                </div>

                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-blue-100 text-blue-800 border border-blue-200 font-bold flex items-center justify-center text-sm shadow-xs">
                  {(user?.name || user?.username || "U")[0].toUpperCase()}
                </div>

                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login?role=student"
                  className="text-sm font-medium px-3.5 py-2 text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?role=admin"
                  className="text-sm font-semibold px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs hover:shadow transition-all"
                >
                  Admin Access
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
