import { useEffect, useState } from "react";
import API from "../services/api";

function AdminFeedback({ eventId }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const validEventId = eventId ? Number(eventId) : null;

  useEffect(() => {
    if (!validEventId) return;
    fetchFeedback();
    fetchSummary();
  }, [validEventId]);

  const fetchFeedback = async () => {
    if (!validEventId) return;
    setLoading(true);
    try {
      const res = await API.get(`/feedback/admin/${validEventId}`);
      setFeedbacks(res.data);
    } catch (err) { console.error("Feedback fetch error:", err); }
    setLoading(false);
  };

  const fetchSummary = async () => {
    if (!validEventId) return;
    try {
      const res = await API.get(`/feedback/ranking-advanced`);
      const eventData = res.data.find(item => item.main_event_id === validEventId);
      setSummary(eventData || null);
    } catch (err) { console.error("Summary fetch error:", err); }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await API.delete(`/feedback/admin/${id}`);
      fetchFeedback();
      fetchSummary();
    } catch (err) { console.error("Delete error:", err); }
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? "#f59e0b" : "#334155" }}>★</span>
    ));

  if (!validEventId) return (
    <div style={{ padding: "32px", textAlign: "center", color: "#475569", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
      Select an event to view feedback.
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        .af-root {
          margin-top: 28px;
          font-family: 'DM Sans', sans-serif;
        }

        .af-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 900;
          color: #f8fafc;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .af-badge {
          background: rgba(129,140,248,0.12);
          border: 1px solid rgba(129,140,248,0.2);
          color: #818cf8;
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
        }

        /* Summary panel */
        .af-summary {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .af-sum-card {
          background: rgba(8,13,46,0.8);
          border: 1px solid rgba(139,92,246,0.12);
          border-radius: 10px;
          padding: 16px 18px;
          backdrop-filter: blur(20px);
        }

        .af-sum-val {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 700;
          display: block;
          margin-bottom: 4px;
        }

        .af-sum-label {
          font-size: 11px;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* Feedback cards */
        .af-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .af-card {
          background: rgba(8,13,46,0.7);
          border: 1px solid rgba(139,92,246,0.1);
          border-radius: 10px;
          padding: 18px 20px;
          backdrop-filter: blur(20px);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .af-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .af-card:hover {
          border-color: rgba(139,92,246,0.2);
        }

        .af-card:hover::before { opacity: 1; }

        .af-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .af-stars { font-size: 16px; letter-spacing: 1px; }

        .af-delete {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
          padding: 5px 12px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .af-delete:hover { background: rgba(239,68,68,0.15); }

        .af-review {
          font-size: 14px;
          color: #94a3b8;
          font-weight: 300;
          line-height: 1.6;
          margin-bottom: 10px;
        }

        .af-meta {
          font-size: 11px;
          color: #475569;
          letter-spacing: 0.04em;
        }

        .af-empty {
          text-align: center;
          padding: 40px;
          color: #475569;
          font-size: 14px;
        }

        .af-empty-icon { font-size: 28px; margin-bottom: 10px; }
      `}</style>

      <div className="af-root">
        <div className="af-title">
          Event Feedback
          {feedbacks.length > 0 && <span className="af-badge">{feedbacks.length} reviews</span>}
        </div>

        {summary && (
          <div className="af-summary">
            <div className="af-sum-card">
              <span className="af-sum-val" style={{ color: "#f59e0b" }}>{Number(summary.avg_rating).toFixed(1)}</span>
              <span className="af-sum-label">Avg Rating</span>
            </div>
            <div className="af-sum-card">
              <span className="af-sum-val" style={{ color: "#818cf8" }}>{summary.feedback_count}</span>
              <span className="af-sum-label">Responses</span>
            </div>
            <div className="af-sum-card">
              <span className="af-sum-val" style={{ color: "#22c55e" }}>{summary.attendance}</span>
              <span className="af-sum-label">Attendance</span>
            </div>
            <div className="af-sum-card">
              <span className="af-sum-val" style={{ color: "#a78bfa" }}>{Number(summary.score).toFixed(2)}</span>
              <span className="af-sum-label">ML Score</span>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ color: "#94a3b8", fontSize: 13, padding: "20px 0" }}>Loading feedback...</div>
        )}

        {!loading && feedbacks.length === 0 && (
          <div className="af-empty">
            <div className="af-empty-icon">💬</div>
            No feedback submitted for this event yet.
          </div>
        )}

        <div className="af-list">
          {feedbacks.map(fb => (
            <div key={fb.id} className="af-card">
              <div className="af-card-header">
                <div className="af-stars">{renderStars(fb.rating)}</div>
                <button className="af-delete" onClick={() => deleteFeedback(fb.id)}>Delete</button>
              </div>
              <p className="af-review">{fb.review}</p>
              <div className="af-meta">
                Submitted: {new Date(fb.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AdminFeedback;
