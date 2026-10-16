import React from "react";

export default function EventCard({ event, onSelect, onRegister, onUnregister, isAuthenticated, isRegistering }) {
  const percentFilled = Math.min(
    100,
    Math.round(((event.registeredCount || 0) / (Number(event.capacity) || 100)) * 100)
  );

  const isSoldOut = event.spotsRemaining <= 0;

  const categoryColors = {
    "Tech & Coding": "bg-blue-600 text-white",
    "Cultural & Arts": "bg-purple-600 text-white",
    "Sports & Fitness": "bg-emerald-600 text-white",
    "Workshops": "bg-amber-600 text-white",
    "Seminars": "bg-indigo-600 text-white",
    "Social": "bg-rose-600 text-white"
  };

  const badgeColor = categoryColors[event.category] || "bg-blue-600 text-white";

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden subtle-shadow hover-lift flex flex-col h-full">
      {/* Event Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80"}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20"></div>

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs ${badgeColor}`}>
            {event.category}
          </span>
        </div>

        {/* Registration State Pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {event.isRegistered ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-xs flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Registered
            </span>
          ) : isSoldOut ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
              Sold Out
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-slate-800 backdrop-blur-xs shadow-xs">
              {event.price || "Free"}
            </span>
          )}
        </div>

        {/* Date banner */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{event.date}</span>
            <span className="text-slate-400">•</span>
            <span>{event.time}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onSelect(event)}
            className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
            title={event.title}
          >
            {event.title}
          </h3>

          <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Venue & Organizer */}
          <div className="mt-3.5 space-y-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate">{event.organizer || "Campus Board"}</span>
            </div>
          </div>
        </div>

        {/* Capacity bar & Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-600">
              Capacity: <span className="font-semibold text-slate-900">{event.registeredCount || 0}</span> / {event.capacity}
            </span>
            <span className={event.spotsRemaining <= 10 && event.spotsRemaining > 0 ? "text-amber-600 font-bold" : "text-slate-500"}>
              {event.spotsRemaining > 0 ? `${event.spotsRemaining} spots left` : "Full"}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                percentFilled > 85 ? "bg-amber-500" : percentFilled === 100 ? "bg-rose-500" : "bg-blue-600"
              }`}
              style={{ width: `${percentFilled}%` }}
            ></div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(event)}
              className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Details
            </button>

            {event.isRegistered ? (
              <button
                type="button"
                disabled={isRegistering}
                onClick={() => onUnregister(event.id)}
                className="py-2 px-3 text-xs font-semibold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
              >
                Cancel RSVP
              </button>
            ) : (
              <button
                type="button"
                disabled={isRegistering || isSoldOut}
                onClick={() => onRegister(event.id)}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSoldOut ? "Full" : "RSVP Now"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
