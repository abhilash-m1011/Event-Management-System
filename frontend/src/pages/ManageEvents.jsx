import { useEffect, useState } from "react";
import API from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import CreateEventForm from "../components/CreateEventForm";
import SubEventManager from "../components/SubEventManager";
import FoodPlanManager from "../components/FoodPlanManager";

function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("events"); // "events" | "manage"

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const endEvent = async (eventId) => {
    if (!window.confirm("Mark this event as ended?")) return;
    try {
      await API.put(`/events/${eventId}/end`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to end event.");
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await API.delete(`/events/${eventId}`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.detail || "Event cannot be deleted. It may have sub-events, food plans, or registrations.");
    }
  };

  const openManage = (event) => {
    setSelectedEvent(event);
    setTab("manage");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --navy: #050818;
          --surface: #080d2e;
          --surface2: rgba(13,19,64,0.7);
          --violet: #7c3aed;
          --purple: #6d28d9;
          --electric: #818cf8;
          --glow: #a78bfa;
          --soft: #c4b5fd;
          --white: #f8fafc;
          --muted: #94a3b8;
          --subtle: #475569;
          --border: rgba(139,92,246,0.12);
          --border2: rgba(139,92,246,0.22);
          --green: #22c55e;
          --red: #ef4444;
        }

        .manage-root {
          min-height: 100vh;
          background: var(--navy);
          font-family: 'DM Sans', sans-serif;
        }

        .manage-content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 32px;
        }

        .manage-header {
          margin-bottom: 28px;
        }

        .manage-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 900;
          color: var(--white);
          margin-bottom: 4px;
        }

        .manage-subtitle {
          font-size: 13px;
          color: var(--muted);
          font-weight: 300;
        }

        /* Tab bar */
        .manage-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 28px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0;
        }

        .manage-tab {
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 400;
          color: var(--muted);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: all 0.2s;
          background: none;
          border-top: none;
          border-left: none;
          border-right: none;
          font-family: 'DM Sans', sans-serif;
        }

        .manage-tab:hover { color: var(--soft); }

        .manage-tab.active {
          color: var(--electric);
          border-bottom-color: var(--electric);
          font-weight: 500;
        }

        /* Events grid */
        .events-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .ev-card {
          background: rgba(8,13,46,0.7);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.25s;
          backdrop-filter: blur(20px);
          position: relative;
        }

        .ev-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--violet), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .ev-card:hover {
          border-color: var(--border2);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }

        .ev-card:hover::before { opacity: 1; }

        .ev-banner {
          width: 100%;
          height: 140px;
          object-fit: cover;
          display: block;
          border-bottom: 1px solid var(--border);
        }

        .ev-body {
          padding: 18px 20px;
        }

        .ev-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--white);
          margin-bottom: 6px;
        }

        .ev-desc {
          font-size: 13px;
          color: var(--muted);
          font-weight: 300;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .ev-ended-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(239,68,68,0.1);
          color: #fca5a5;
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 100px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .ev-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ev-btn {
          flex: 1;
          min-width: 80px;
          padding: 8px 12px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          text-align: center;
        }

        .ev-btn-end {
          background: rgba(245,158,11,0.1);
          color: #fcd34d;
          border-color: rgba(245,158,11,0.2);
        }
        .ev-btn-end:hover { background: rgba(245,158,11,0.18); }

        .ev-btn-delete {
          background: rgba(239,68,68,0.1);
          color: #fca5a5;
          border-color: rgba(239,68,68,0.2);
        }
        .ev-btn-delete:hover { background: rgba(239,68,68,0.18); }

        .ev-btn-manage {
          background: rgba(129,140,248,0.1);
          color: var(--electric);
          border-color: rgba(129,140,248,0.2);
        }
        .ev-btn-manage:hover {
          background: rgba(129,140,248,0.18);
          border-color: var(--electric);
        }

        /* Create form section */
        .create-section {
          background: rgba(8,13,46,0.7);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 28px;
          backdrop-filter: blur(20px);
        }

        .create-section-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--soft);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Manage panel */
        .manage-panel {
          background: rgba(8,13,46,0.7);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          backdrop-filter: blur(20px);
          margin-bottom: 20px;
        }

        .manage-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .manage-panel-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--white);
        }

        .back-to-events {
          background: rgba(139,92,246,0.1);
          border: 1px solid var(--border2);
          color: var(--soft);
          padding: 7px 14px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .back-to-events:hover {
          background: rgba(139,92,246,0.18);
          border-color: var(--electric);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--subtle);
        }

        .empty-state-icon { font-size: 36px; margin-bottom: 12px; }
        .empty-state p { font-size: 14px; }

        .loading-text {
          text-align: center;
          padding: 40px;
          color: var(--muted);
          font-size: 14px;
        }

        @media (max-width: 600px) {
          .manage-content { padding: 20px 16px; }
          .events-list { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="manage-root">
        <AdminNavbar />
        <div className="manage-content">

          <div className="manage-header">
            <h1 className="manage-title">Event Management</h1>
            <p className="manage-subtitle">Create, configure, and manage all symposium events</p>
          </div>

          <div className="manage-tabs">
            <button className={`manage-tab ${tab === "events" ? "active" : ""}`} onClick={() => setTab("events")}>
              All Events
            </button>
            <button className={`manage-tab ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}>
              + Create Event
            </button>
            {selectedEvent && (
              <button className={`manage-tab ${tab === "manage" ? "active" : ""}`} onClick={() => setTab("manage")}>
                Managing: {selectedEvent.title}
              </button>
            )}
          </div>

          {/* ALL EVENTS */}
          {tab === "events" && (
            <>
              {loading && <p className="loading-text">Loading events...</p>}

              {!loading && events.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <p>No events found. Create your first event.</p>
                </div>
              )}

              <div className="events-list">
                {events.map((event) => (
                  <div key={event.id} className="ev-card">
                    {event.banner_url && (
                      <img
                        src={`http://127.0.0.1:8000/${event.banner_url}`}
                        alt="Event Banner"
                        className="ev-banner"
                      />
                    )}
                    <div className="ev-body">
                      <div className="ev-title">{event.title}</div>
                      <p className="ev-desc">{event.description}</p>
                      {event.is_ended && (
                        <div className="ev-ended-badge">⏹ Ended</div>
                      )}
                      <div className="ev-actions">
                        {!event.is_ended && (
                          <button className="ev-btn ev-btn-end" onClick={() => endEvent(event.id)}>
                            End
                          </button>
                        )}
                        <button className="ev-btn ev-btn-delete" onClick={() => deleteEvent(event.id)}>
                          Delete
                        </button>
                        <button className="ev-btn ev-btn-manage" onClick={() => openManage(event)}>
                          Manage →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CREATE */}
          {tab === "create" && (
            <div className="create-section">
              <div className="create-section-title">🗂 New Event</div>
              <CreateEventForm onCreated={() => { fetchEvents(); setTab("events"); }} />
            </div>
          )}

          {/* MANAGE */}
          {tab === "manage" && selectedEvent && (
            <>
              <div className="manage-panel">
                <div className="manage-panel-header">
                  <div className="manage-panel-title">Sub Events — {selectedEvent.title}</div>
                  <button className="back-to-events" onClick={() => setTab("events")}>← Back</button>
                </div>
                <SubEventManager event={selectedEvent} />
              </div>

              <div className="manage-panel">
                <div className="manage-panel-title" style={{ marginBottom: 20 }}>
                  Food Plans — {selectedEvent.title}
                </div>
                <FoodPlanManager event={selectedEvent} />
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}

export default ManageEvents;
