import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function StudentDashboard() {
  const { user, token } = useAuth();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [notification, setNotification] = useState("");

  const fetchMyRegistrations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/events/my-registrations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Could not load your registered events.");
      const data = await res.json();
      setRegistrations(data);
    } catch (err) {
      setError(err.message || "Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyRegistrations();
  }, [fetchMyRegistrations]);

  const handleCancel = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to cancel your pass for "${title}"?`)) {
      return;
    }

    setCancelingId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/unregister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not cancel pass.");

      setNotification(`Cancelled pass for "${title}". Spot released.`);
      setTimeout(() => setNotification(""), 4000);
      await fetchMyRegistrations();
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span>ℹ️</span>
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Student Welcome Header Card */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
            <svg className="w-80 h-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold mb-3">
                <span>🎓</span>
                <span>Verified Student Profile</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Hi, {user?.name || user?.username}!
              </h1>
              <p className="mt-2 text-blue-100 text-sm max-w-xl">
                Manage your confirmed campus event passes, presentation entry barcodes, and workshop RSVPs.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-blue-200">
                <span>Student ID: <strong className="text-white font-mono">{user?.studentId || "STU-8821"}</strong></span>
                <span>•</span>
                <span>Department: <strong className="text-white">{user?.department || "Computer Science"}</strong></span>
                <span>•</span>
                <span>Email: <strong className="text-white">{user?.email || "alex.student@unievents.edu"}</strong></span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center shrink-0">
              <p className="text-4xl font-black text-white">{registrations.length}</p>
              <p className="text-xs text-blue-200 font-medium uppercase tracking-wider mt-1">Active Passes</p>
            </div>
          </div>
        </div>

        {/* Section Heading & Explore CTA */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              My Registered Event Passes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Present your Digital Pass code at venue doors for expedited check-in.
            </p>
          </div>

          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Browse More Events</span>
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-slate-500 font-medium">Loading your registered passes...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center mb-6">
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={fetchMyRegistrations}
              className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Registered Passes Grid */}
        {!loading && !error && registrations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map((reg) => {
              const evt = reg.event;
              return (
                <div
                  key={reg.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col sm:flex-row"
                >
                  {/* Event Thumbnail */}
                  <div className="sm:w-48 h-48 sm:h-auto relative bg-slate-100 shrink-0">
                    <img
                      src={evt?.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80"}
                      alt={evt?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs">
                        {evt?.category || "Event"}
                      </span>
                    </div>
                  </div>

                  {/* Pass Information */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          ● Confirmed Seat
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(reg.registeredAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                        {evt?.title}
                      </h3>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">📅</span>
                          <span>{evt?.date} • {evt?.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">📍</span>
                          <span className="truncate">{evt?.venue}</span>
                        </div>
                      </div>

                      {/* Ticket Code Box */}
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Pass Code</span>
                          <p className="font-mono font-bold text-slate-900 text-sm tracking-wider">
                            {reg.ticketCode}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedTicket({ reg, evt })}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                        >
                          View Pass
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Organized by {evt?.organizer}
                      </span>
                      <button
                        disabled={cancelingId === reg.eventId}
                        onClick={() => handleCancel(reg.eventId, evt?.title)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline disabled:opacity-50"
                      >
                        {cancelingId === reg.eventId ? "Canceling..." : "Cancel Pass"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && registrations.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 text-2xl">
              🎟️
            </div>
            <h3 className="text-lg font-bold text-slate-900">No active passes yet</h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
              You haven't RSVP'd to any events yet. Browse our upcoming tech symposiums, concerts, hackathons, and tournaments!
            </p>
            <Link
              to="/"
              className="mt-6 inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all"
            >
              Explore Campus Events
            </Link>
          </div>
        )}
      </main>

      {/* Ticket Pass Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                ✕
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                UniEvents Official Entry Pass
              </span>
              <h3 className="text-xl font-black mt-3">{selectedTicket.evt?.title}</h3>
              <p className="text-xs text-blue-100 mt-1">{selectedTicket.evt?.venue}</p>
            </div>

            {/* Pass Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400">Date</span>
                  <p className="font-bold text-slate-800">{selectedTicket.evt?.date}</p>
                </div>
                <div>
                  <span className="text-slate-400">Time</span>
                  <p className="font-bold text-slate-800">{selectedTicket.evt?.time}</p>
                </div>
                <div>
                  <span className="text-slate-400">Attendee</span>
                  <p className="font-bold text-slate-800">{selectedTicket.reg?.userName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Student ID</span>
                  <p className="font-bold text-slate-800">{selectedTicket.reg?.studentId}</p>
                </div>
              </div>

              {/* Barcode Mock Visual */}
              <div className="p-4 bg-slate-900 rounded-2xl text-center text-white">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Digital Entry Token</span>
                <p className="font-mono text-2xl font-black tracking-widest text-emerald-400 my-2">
                  {selectedTicket.reg?.ticketCode}
                </p>
                <div className="h-10 bg-white/10 rounded flex items-center justify-center text-xs font-mono text-slate-400">
                  ||||| | |||| ||| |||||| | ||||| |||| || |||||
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
