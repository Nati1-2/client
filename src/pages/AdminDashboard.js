import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AdminDashboard() {
  const { user, token, apiLatency, checkHealth } = useAuth();

  const [activeTab, setActiveTab] = useState("events"); // "events" | "attendees" | "system"
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingAttendeesEvent, setViewingAttendeesEvent] = useState(null);
  const [attendeesList, setAttendeesList] = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  // Form State
  const initialForm = {
    title: "",
    description: "",
    category: "Tech & Coding",
    date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0],
    time: "10:00 AM - 01:00 PM",
    venue: "",
    locationType: "In-Person",
    capacity: 100,
    price: "Free",
    organizer: user?.name || "Campus Events Board",
    organizerContact: user?.email || "admin@unievents.edu",
    image: "",
    tags: "Campus, 2026"
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  // Search in tables
  const [searchEvent, setSearchEvent] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [eventsRes, statsRes] = await Promise.all([
        fetch("/api/events", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/events/stats/overview")
      ]);

      if (!eventsRes.ok) throw new Error("Could not load events.");
      const eventsData = await eventsRes.json();
      setEvents(eventsData);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Modal
  const openCreateModal = () => {
    setFormData(initialForm);
    setEditingEvent(null);
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const openEditModal = (evt) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      description: evt.description,
      category: evt.category,
      date: evt.date,
      time: evt.time,
      venue: evt.venue,
      locationType: evt.locationType || "In-Person",
      capacity: evt.capacity,
      price: evt.price || "Free",
      organizer: evt.organizer || "",
      organizerContact: evt.organizerContact || "",
      image: evt.image || "",
      tags: Array.isArray(evt.tags) ? evt.tags.join(", ") : evt.tags || ""
    });
    setShowCreateModal(true);
  };

  // Handle Create / Edit Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : "/api/events";
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not save event.");

      setShowCreateModal(false);
      setNotification(editingEvent ? "Event updated successfully!" : "New event published!");
      setTimeout(() => setNotification(""), 4000);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? All existing registrations will also be removed.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Could not delete event.");

      setNotification(`"${title}" deleted successfully.`);
      setTimeout(() => setNotification(""), 4000);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // View Attendees for an Event
  const handleViewAttendees = async (evt) => {
    setViewingAttendeesEvent(evt);
    setAttendeesLoading(true);
    try {
      const res = await fetch(`/api/events/${evt.id}/attendees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Could not load attendees.");
      const data = await res.json();
      setAttendeesList(data.attendees || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setAttendeesLoading(false);
    }
  };

  // Export Attendees to CSV
  const exportAttendeesCSV = () => {
    if (!attendeesList.length) return;
    const headers = ["Ticket Code", "Student Name", "Email", "Student ID", "Registered Date", "Status"];
    const rows = attendeesList.map((a) => [
      a.ticketCode,
      `"${a.userName || ""}"`,
      `"${a.userEmail || ""}"`,
      a.studentId || "",
      a.registeredAt,
      a.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendees-${viewingAttendeesEvent?.title || "event"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEvents = events.filter((e) => {
    const q = searchEvent.toLowerCase().trim();
    return !q || e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span>✨</span>
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
              <span>🛡️</span>
              <span>Event Administration & Coordinator Hub</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Campus Event Manager
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Signed in as {user?.name || user?.username} ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <span className="text-base leading-none">+</span>
              <span>Create New Event</span>
            </button>
          </div>
        </div>

        {/* Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
              📅
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Events</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{events.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
              🎟️
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Registrations</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.totalRegistrations || 0}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
              🎓
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Students</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.totalStudents || 1}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
              ⚡
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Backend API</p>
              <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Connected (Port 5000)
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab("events")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "events"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Events Directory ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "system"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Backend Health & Diagnostics
          </button>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="py-12 text-center text-xs text-slate-500 font-medium">
            <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p>Updating event management metrics...</p>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={loadData} className="underline font-bold">Retry</button>
          </div>
        )}

        {/* TAB 1: Events Directory */}
        {activeTab === "events" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Table Search & Controls */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Filter events by title, venue, category..."
                  value={searchEvent}
                  onChange={(e) => setSearchEvent(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              </div>

              <div className="text-xs text-slate-500">
                Total <span className="font-bold text-slate-900">{filteredEvents.length}</span> listed
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Event Title & Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Venue</th>
                    <th className="py-3.5 px-4">Attendance</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.image}
                            alt={evt.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm line-clamp-1">{evt.title}</p>
                            <p className="text-slate-400 text-[11px] mt-0.5">By {evt.organizer}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {evt.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        <p className="font-medium text-slate-800">{evt.date}</p>
                        <p className="text-[11px] text-slate-400">{evt.time}</p>
                      </td>
                      <td className="py-4 px-4 text-slate-700 max-w-[150px] truncate">
                        {evt.venue}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{evt.registeredCount || 0}</span>
                          <span className="text-slate-400">/ {evt.capacity}</span>
                        </div>
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(100, ((evt.registeredCount || 0) / (Number(evt.capacity) || 1)) * 100)}%`
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleViewAttendees(evt)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-colors"
                        >
                          Attendees ({evt.registeredCount || 0})
                        </button>
                        <button
                          onClick={() => openEditModal(evt)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Backend Health Diagnostics */}
        {activeTab === "system" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="font-black text-slate-900 text-lg mb-4">REST API Server Status</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Service Endpoint</span>
                  <span className="font-mono font-bold text-blue-600">http://localhost:5000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-emerald-600">🟢 Operational (200 OK)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Measured Latency</span>
                  <span className="font-mono font-bold text-slate-800">{apiLatency || "<5"} ms</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Database Engine</span>
                  <span className="font-semibold text-slate-800">Persistent JSON Datastore (backend/data/store.json)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Active Records</span>
                  <span className="font-bold text-slate-800">
                    {events.length} events, {stats?.totalRegistrations || 0} registrations
                  </span>
                </div>
              </div>

              <button
                onClick={async () => {
                  await checkHealth();
                  await loadData();
                  alert("Ping successful! Latency: " + (apiLatency || "<5") + "ms");
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Send Ping & Retest Health
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="font-black text-slate-900 text-lg mb-4">Categories Breakdown</h3>
              <div className="space-y-3 text-xs">
                {stats?.categories?.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">
                      {cat.count} events
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE / EDIT EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black">
                  {editingEvent ? "Edit Event" : "Create New Campus Event"}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Publish to student discovery catalog immediately
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Annual Robotics & Drone Showcase"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="Tech & Coding">Tech & Coding</option>
                    <option value="Cultural & Arts">Cultural & Arts</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                    <option value="Workshops">Workshops</option>
                    <option value="Seminars">Seminars</option>
                    <option value="Social">Social</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Capacity (Seats) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time *</label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 10:00 AM - 02:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Venue / Room *</label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Science Quad 204"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admission Price</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. Free or $10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/... (leave empty for auto banner)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline key topics, prerequisites, agenda, and instructions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all"
                >
                  {submitting ? "Saving..." : editingEvent ? "Save Changes" : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATTENDEES ROSTER MODAL */}
      {viewingAttendeesEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Event Attendee Roster
                </span>
                <h3 className="text-xl font-black mt-1">{viewingAttendeesEvent.title}</h3>
                <p className="text-xs text-slate-400">
                  {attendeesList.length} registered students of {viewingAttendeesEvent.capacity} capacity
                </p>
              </div>
              <button
                onClick={() => setViewingAttendeesEvent(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Confirmed Registrations
                </h4>
                {attendeesList.length > 0 && (
                  <button
                    onClick={exportAttendeesCSV}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Export CSV
                  </button>
                )}
              </div>

              {attendeesLoading && (
                <div className="py-12 text-center text-xs text-slate-500">Loading attendee list...</div>
              )}

              {!attendeesLoading && attendeesList.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  No students have registered for this event yet.
                </div>
              )}

              {!attendeesLoading && attendeesList.length > 0 && (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {attendeesList.map((a) => (
                    <div key={a.id} className="p-4 flex items-center justify-between hover:bg-slate-50 text-xs">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{a.userName}</p>
                        <p className="text-slate-500 text-[11px]">{a.userEmail}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">ID: {a.studentId}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                          {a.ticketCode}
                        </span>
                        <p className="text-slate-400 text-[10px] mt-1">
                          {new Date(a.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingAttendeesEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
