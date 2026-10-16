import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import EventDetailModal from "../components/EventDetailModal";

const CATEGORIES = [
  "All",
  "Tech & Coding",
  "Cultural & Arts",
  "Sports & Fitness",
  "Workshops",
  "Seminars",
  "Social"
];

export default function Home() {
  const { token, isAuthenticated, isStudent, apiOnline } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/events", { headers });
      if (!res.ok) throw new Error("Could not fetch events from server.");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the events backend. Please ensure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle Register RSVP
  const handleRegister = async (eventId) => {
    if (!isAuthenticated) {
      navigate(`/login?role=student&redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsRegistering(true);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register.");

      setFeedbackMsg("🎉 Successfully registered! Your spot is confirmed.");
      setTimeout(() => setFeedbackMsg(""), 4000);
      await fetchEvents();

      // Update selected event if open in modal
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(data.event);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle Unregister RSVP
  const handleUnregister = async (eventId) => {
    setIsRegistering(true);
    try {
      const res = await fetch(`/api/events/${eventId}/unregister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel.");

      setFeedbackMsg("Pass canceled successfully.");
      setTimeout(() => setFeedbackMsg(""), 3500);
      await fetchEvents();

      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(data.event);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    const matchesCategory =
      selectedCategory === "All" || e.category.toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      (e.tags && e.tags.some((t) => t.toLowerCase().includes(q)));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Floating Notification */}
      {feedbackMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="text-xl">✨</span>
          <span className="text-sm font-semibold">{feedbackMsg}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-6 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Campus Fall & Spring 2026 Season Active
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Discover, Organize & Experience{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              Campus Life.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From premier tech hackathons and symphony concerts to sports cups and workshops. RSVP with instant digital passes or coordinate campus-wide events seamlessly.
          </p>

          {/* Quick Demo CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login?role=student"
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 hover:scale-105"
                >
                  Student Portal Demo
                </Link>
                <Link
                  to="/login?role=admin"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition-all hover:scale-105"
                >
                  Admin Management Demo
                </Link>
              </>
            ) : isStudent ? (
              <Link
                to="/student"
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/30 hover:scale-105"
              >
                Go to My Passes & Dashboard →
              </Link>
            ) : (
              <Link
                to="/admin"
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 hover:scale-105"
              >
                Open Admin Console →
              </Link>
            )}
          </div>

          {/* Live Platform Stats */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-slate-800/80 text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">{events.length || 6}</p>
              <p className="text-xs text-slate-400 mt-1">Active Campus Events</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">1,250+</p>
              <p className="text-xs text-slate-400 mt-1">Available Seats</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">6</p>
              <p className="text-xs text-slate-400 mt-1">Specialized Categories</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</p>
              <p className="text-xs text-slate-400 mt-1">Digital QR Verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 flex-1 w-full pb-16">
        {/* Search & Filter Bar Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 sm:p-6 mb-10">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <svg
                className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by title, venue, speaker, or keyword..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/60 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Status Pill */}
            <div className="text-xs font-semibold text-slate-500 shrink-0">
              Showing <span className="text-blue-600 font-bold">{filteredEvents.length}</span> events
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 mt-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Backend offline warning banner */}
        {!apiOnline && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-bold text-sm">Backend API not detected</p>
                <p className="text-xs text-amber-700">Please make sure the backend server is running on port 5000.</p>
              </div>
            </div>
            <button
              onClick={fetchEvents}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-slate-500 font-medium">Loading events catalogue...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-16 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              ✕
            </div>
            <h3 className="font-bold text-slate-800">Connection Error</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
            <button
              onClick={fetchEvents}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Event Grid */}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onSelect={(e) => setSelectedEvent(e)}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
                isAuthenticated={isAuthenticated}
                isRegistering={isRegistering}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/80 p-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800">No events found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No events matched your search query or filter. Try clearing your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={handleRegister}
          onUnregister={handleUnregister}
          isAuthenticated={isAuthenticated}
          isRegistering={isRegistering}
        />
      )}

      <Footer />
    </div>
  );
}
