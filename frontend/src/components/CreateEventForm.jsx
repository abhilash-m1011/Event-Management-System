import { useState } from "react";
import API from "../services/api";

function CreateEventForm({ onCreated }) {
  const [form, setForm] = useState({
    title: "", description: "", location: "",
    eventDate: "", startTime: "", endTime: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const createEvent = async () => {
    if (!form.title || !form.eventDate) { setError("Title and date are required."); return; }
    setError("");
    setLoading(true);
    try {
      await API.post("/events/", {
        title: form.title,
        description: form.description,
        location: form.location,
        event_date: form.eventDate,
        start_time: form.startTime,
        end_time: form.endTime,
      });
      setForm({ title: "", description: "", location: "", eventDate: "", startTime: "", endTime: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create event.");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        .cef-root { font-family: 'DM Sans', sans-serif; }

        .cef-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .cef-full { grid-column: 1 / -1; }

        .cef-field { display: flex; flex-direction: column; gap: 6px; }

        .cef-label {
          font-size: 11px;
          font-weight: 500;
          color: #c4b5fd;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .cef-input, .cef-textarea {
          background: rgba(5,8,24,0.7);
          border: 1px solid rgba(139,92,246,0.18);
          border-radius: 8px;
          padding: 11px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #f8fafc;
          outline: none;
          transition: all 0.2s;
          caret-color: #818cf8;
          width: 100%;
        }

        .cef-input::placeholder, .cef-textarea::placeholder { color: rgba(148,163,184,0.3); }

        .cef-input:focus, .cef-textarea:focus {
          border-color: rgba(139,92,246,0.5);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
          background: rgba(8,13,46,0.9);
        }

        .cef-textarea { resize: vertical; min-height: 80px; }

        /* Date/time input styling */
        .cef-input[type="date"],
        .cef-input[type="datetime-local"] {
          color-scheme: dark;
        }

        .cef-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 7px;
          padding: 10px 14px;
          font-size: 13px;
          color: #fca5a5;
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cef-success {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 7px;
          padding: 10px 14px;
          font-size: 13px;
          color: #86efac;
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cef-btn {
          margin-top: 16px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white;
          border: none;
          padding: 13px 28px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(109,40,217,0.3);
        }

        .cef-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(109,40,217,0.45);
        }

        .cef-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .cef-spinner {
          display: inline-block;
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 600px) {
          .cef-grid { grid-template-columns: 1fr; }
          .cef-full { grid-column: 1; }
        }
      `}</style>

      <div className="cef-root">
        <div className="cef-grid">
          <div className="cef-field cef-full">
            <label className="cef-label">Event Title *</label>
            <input className="cef-input" placeholder="e.g. Tech Symposium 2025" value={form.title} onChange={set("title")} />
          </div>

          <div className="cef-field cef-full">
            <label className="cef-label">Description</label>
            <textarea className="cef-textarea" placeholder="Brief description of the event..." value={form.description} onChange={set("description")} />
          </div>

          <div className="cef-field">
            <label className="cef-label">Location</label>
            <input className="cef-input" placeholder="Venue or city" value={form.location} onChange={set("location")} />
          </div>

          <div className="cef-field">
            <label className="cef-label">Event Date *</label>
            <input className="cef-input" type="date" value={form.eventDate} onChange={set("eventDate")} />
          </div>

          <div className="cef-field">
            <label className="cef-label">Start Time</label>
            <input className="cef-input" type="datetime-local" value={form.startTime} onChange={set("startTime")} />
          </div>

          <div className="cef-field">
            <label className="cef-label">End Time</label>
            <input className="cef-input" type="datetime-local" value={form.endTime} onChange={set("endTime")} />
          </div>
        </div>

        {error && <div className="cef-error">⚠ {error}</div>}
        {success && <div className="cef-success">✓ Event created successfully!</div>}

        <button className="cef-btn" onClick={createEvent} disabled={loading}>
          {loading && <span className="cef-spinner" />}
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>
    </>
  );
}

export default CreateEventForm;
