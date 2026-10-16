import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { apiOnline } = useAuth();

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-24 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                U
              </div>
              <span className="text-white font-bold text-lg tracking-tight">UniEvents</span>
            </div>
            <p className="text-slate-400 max-w-md text-sm leading-relaxed mb-4">
              The unified campus event management platform. Discover seminars, tech summits, athletics, and fine arts concerts, with real-time pass generation and attendee tracking.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className={`inline-block w-2 h-2 rounded-full ${apiOnline ? "bg-emerald-400" : "bg-rose-400"}`}></span>
              <span>Backend status: {apiOnline ? "Connected & Healthy (Port 5000)" : "Connecting..."}</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Explore All Events</Link>
              </li>
              <li>
                <Link to="/student" className="hover:text-white transition-colors">Student Passes</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">Admin Event Manager</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Sign In Portal</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">Demo Credentials</h4>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
              <p>
                <strong className="text-blue-400">Admin:</strong> <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">admin</code> / <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">admin123</code>
              </p>
              <p>
                <strong className="text-indigo-400">Student:</strong> <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">student</code> / <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">student123</code>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} UniEvents Campus Platform. Fully integrated frontend & backend.</p>
          <div className="flex gap-4 mt-3 sm:mt-0">
            <span className="hover:text-slate-400">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400">Campus Code of Conduct</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
