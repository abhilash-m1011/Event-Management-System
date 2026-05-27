import { useEffect, useState } from "react";
import API from "../services/api";

function SubEventManager({ event }) {
  const [subEvents, setSubEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSubEvents = async () => {
    try {
      const res = await API.get(`/sub-events/${event.id}`);
      setSubEvents(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSubEvents(); }, [event]);

  const createSubEvent = async () => {
    if (!title) { setError("Title is required."); return; }
    setError(""); setLoading(true);
    try {
      await API.post(`/sub-events/${event.id}`, {
        title,
        description: "",
        capacity: 100,
        price: Number(price) || 0,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString()
      });
      setTitle(""); setPrice("");
      setSuccess("Sub-event added!"); setTimeout(() => setSuccess(""), 2500);
      fetchSubEvents();
    } catch (err) { setError(err.response?.data?.detail || "Failed to add sub-event."); }
    setLoading(false);
  };

  const deleteSubEvent = async (id) => {
    if (!window.confirm("Delete this sub-event?")) return;
    try {
      await API.delete(`/sub-events/${id}`);
      fetchSubEvents();
    } catch (err) { setError(err.response?.data?.detail || "Delete failed."); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        .sem-root { font-family: 'DM Sans', sans-serif; }

        .sem-form {
          display: grid;
          grid-template-columns: 1fr 160px auto;
          gap: 10px;
          align-items: end;
          margin-bottom: 18px;
        }

        .sem-field { display: flex; flex-direction: column; gap: 5px; }

        .sem-label {
          font-size: 10px;
          font-weight: 500;
          color: #c4b5fd;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .sem-input {
          background: rgba(5,8,24,0.7);
          border: 1px solid rgba(139,92,246,0.18);
          border-radius: 7px;
          padding: 10px 13px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #f8fafc;
          outline: none;
          transition: all 0.2s;
          caret-color: #818cf8;
          width: 100%;
        }

        .sem-input::placeholder { color: rgba(148,163,184,0.3); }
        .sem-input:focus { border-color: rgba(139,92,246,0.5); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }

        .sem-add-btn {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s;
          white-space: nowrap;
          box-shadow: 0 3px 14px rgba(109,40,217,0.3);
          align-self: end;
        }

        .sem-add-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(109,40,217,0.45); }
        .sem-add-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .sem-msg {
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sem-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; }
        .sem-success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #86efac; }

        .sem-list { display: flex; flex-direction: column; gap: 8px; }

        .sem-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(5,8,24,0.5);
          border: 1px solid rgba(139,92,246,0.1);
          border-radius: 8px;
          padding: 12px 16px;
          transition: all 0.2s;
        }

        .sem-item:hover { border-color: rgba(139,92,246,0.2); background: rgba(8,13,46,0.6); }

        .sem-item-left { display: flex; align-items: center; gap: 10px; }

        .sem-item-dot {
          width: 6px; height: 6px;
          background: #818cf8;
          border-radius: 50%;
          box-shadow: 0 0 6px #818cf8;
          flex-shrink: 0;
        }

        .sem-item-title { font-size: 14px; color: #f8fafc; font-weight: 400; }

        .sem-item-right { display: flex; align-items: center; gap: 12px; }

        .sem-price {
          font-size: 13px;
          font-weight: 500;
          color: #818cf8;
          font-family: monospace;
        }

        .sem-delete {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
          color: #fca5a5;
          padding: 5px 12px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sem-delete:hover { background: rgba(239,68,68,0.15); }

        .sem-empty {
          text-align: center;
          padding: 24px;
          color: #475569;
          font-size: 13px;
        }

        @media (max-width: 600px) {
          .sem-form { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sem-root">
        <div className="sem-form">
          <div className="sem-field">
            <label className="sem-label">Sub-Event Title *</label>
            <input className="sem-input" placeholder="e.g. Workshop, Talk..." value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="sem-field">
            <label className="sem-label">Price (₹)</label>
            <input className="sem-input" type="number" placeholder="0" value={price} onChange={e => setPrice(e.target.value)} min="0" />
          </div>
          <button className="sem-add-btn" onClick={createSubEvent} disabled={loading}>
            {loading ? "Adding..." : "+ Add"}
          </button>
        </div>

        {error && <div className="sem-msg sem-error">⚠ {error}</div>}
        {success && <div className="sem-msg sem-success">✓ {success}</div>}

        <div className="sem-list">
          {subEvents.length === 0 ? (
            <div className="sem-empty">No sub-events added yet</div>
          ) : (
            subEvents.map(sub => (
              <div key={sub.id} className="sem-item">
                <div className="sem-item-left">
                  <div className="sem-item-dot" />
                  <span className="sem-item-title">{sub.title}</span>
                </div>
                <div className="sem-item-right">
                  <span className="sem-price">₹{sub.price}</span>
                  <button className="sem-delete" onClick={() => deleteSubEvent(sub.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default SubEventManager;
