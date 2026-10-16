import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Login() {
  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get("role") === "admin" ? "admin" : "student";
  const redirect = searchParams.get("redirect");

  const [mode, setMode] = useState("signin"); // "signin" | "register"
  const [role, setRole] = useState(initialRole);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (redirect) {
        navigate(redirect, { replace: true });
      } else {
        navigate(user.role === "admin" ? "/admin" : "/student", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, redirect]);

  // Demo auto-fill and login
  const handleQuickDemo = async (demoRole) => {
    setError("");
    setLoading(true);
    setRole(demoRole);
    const demoCreds =
      demoRole === "admin"
        ? { username: "admin", password: "admin123", role: "admin" }
        : { username: "student", password: "student123", role: "student" };

    try {
      const loggedIn = await login(demoCreds);
      if (redirect) {
        navigate(redirect, { replace: true });
      } else {
        navigate(loggedIn.role === "admin" ? "/admin" : "/student", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Failed to sign in with demo credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const loggedIn = await login({ username, password, role });
        if (redirect) {
          navigate(redirect, { replace: true });
        } else {
          navigate(loggedIn.role === "admin" ? "/admin" : "/student", { replace: true });
        }
      } else {
        const registered = await register({
          username,
          password,
          name: name || username,
          email,
          role,
          department
        });
        if (redirect) {
          navigate(redirect, { replace: true });
        } else {
          navigate(registered.role === "admin" ? "/admin" : "/student", { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || "Authentication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-6 text-center border-b border-slate-100 bg-gradient-to-b from-blue-50/60 to-white">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-blue-500/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {mode === "signin"
                ? "Sign in to manage passes and campus event registries"
                : "Join the campus event management network"}
            </p>
          </div>

          <div className="p-8 pt-6 space-y-6">
            {/* Quick Demo Access Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                  ⚡ 1-Click Demo Access
                </span>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-100/80 px-2 py-0.5 rounded-full">
                  Instant Test
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemo("student")}
                  className="py-2.5 px-3 rounded-xl bg-white text-slate-800 text-xs font-bold border border-blue-200 hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>🎓</span>
                  <span>Demo Student</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemo("admin")}
                  className="py-2.5 px-3 rounded-xl bg-white text-slate-800 text-xs font-bold border border-indigo-200 hover:border-indigo-400 hover:shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>🛡️</span>
                  <span>Demo Admin</span>
                </button>
              </div>
            </div>

            {/* Mode Switcher: Sign In vs Register */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  mode === "signin" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  mode === "register" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Register New
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      role === "student"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>🎓</span> Student / Attendee
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      role === "admin"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>🛡️</span> Event Admin
                  </button>
                </div>
              </div>

              {/* Extra Register Fields */}
              {mode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Smith"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. jsmith@university.edu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Department / College</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science & AI"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                {loading ? "Processing..." : mode === "signin" ? "Sign In to UniEvents" : "Create Account"}
              </button>
            </form>

            {/* Back Link */}
            <p className="text-center text-xs text-slate-500 pt-2">
              <Link to="/" className="text-blue-600 hover:underline font-semibold">
                ← Back to Event Discovery
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
