import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function EventOverview() {
  const { eventId } = useParams();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/admin/dashboard/main-event/" + eventId)
      .then(res => setStats(res.data))
      .catch(console.error);
  }, [eventId]);

  if (!stats) return (
    <div style={{ color: "#94a3b8", padding: 40, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>⏳</div>
      Loading overview...
    </div>
  );

  const cards = [
    { icon: "👥", label: "Total Registrations", value: stats.total_registrations, accent: "#818cf8" },
    { icon: "✅", label: "Checked In", value: stats.checked_in, accent: "#22c55e" },
    { icon: "⏳", label: "Pending Check-In", value: stats.pending_check_in, accent: "#f59e0b" },
    { icon: "🍽", label: "Food Collected", value: stats.food_collections, accent: "#a78bfa" },
    { icon: "💰", label: "Revenue", value: `₹${(stats.total_revenue || 0).toLocaleString()}`, accent: "#818cf8" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        .eo-root { font-family: 'DM Sans', sans-serif; }

        .eo-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 900;
          color: #f8fafc;
          margin-bottom: 4px;
        }

        .eo-sub {
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 24px;
          font-weight: 300;
        }

        .eo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 14px;
        }

        .eo-card {
          background: rgba(8,13,46,0.8);
          border: 1px solid rgba(139,92,246,0.12);
          border-radius: 12px;
          padding: 20px 18px;
          backdrop-filter: blur(20px);
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }

        .eo-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent, #7c3aed), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .eo-card:hover {
          border-color: rgba(139,92,246,0.24);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .eo-card:hover::before { opacity: 1; }

        .eo-icon { font-size: 20px; margin-bottom: 12px; display: block; }

        .eo-val {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          display: block;
          margin-bottom: 5px;
        }

        .eo-label {
          font-size: 11px;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* Recent regs table */
        .eo-table-wrap {
          margin-top: 28px;
          background: rgba(8,13,46,0.8);
          border: 1px solid rgba(139,92,246,0.12);
          border-radius: 12px;
          overflow: hidden;
          backdrop-filter: blur(20px);
        }

        .eo-table-head {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(139,92,246,0.12);
          font-size: 12px;
          font-weight: 600;
          color: #c4b5fd;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .eo-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .eo-table th {
          padding: 10px 16px;
          text-align: left;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #475569;
          border-bottom: 1px solid rgba(139,92,246,0.08);
        }

        .eo-table td {
          padding: 12px 16px;
          color: #94a3b8;
          border-bottom: 1px solid rgba(139,92,246,0.04);
        }

        .eo-table tr:last-child td { border-bottom: none; }
        .eo-table tbody tr:hover { background: rgba(139,92,246,0.04); }

        .paid-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(34,197,94,0.1);
          color: #86efac;
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 100px;
          padding: 2px 9px;
          font-size: 11px;
          font-weight: 500;
        }

        .pending-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(245,158,11,0.1);
          color: #fcd34d;
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 100px;
          padding: 2px 9px;
          font-size: 11px;
          font-weight: 500;
        }
      `}</style>

      <div className="eo-root">
        <h2 className="eo-title">Event Overview</h2>
        <p className="eo-sub">Live stats for this event</p>

        <div className="eo-grid">
          {cards.map(({ icon, label, value, accent }) => (
            <div key={label} className="eo-card" style={{ "--accent": accent }}>
              <span className="eo-icon">{icon}</span>
              <span className="eo-val" style={{ color: accent }}>{value}</span>
              <span className="eo-label">{label}</span>
            </div>
          ))}
        </div>

        {stats.recent_registrations?.length > 0 && (
          <div className="eo-table-wrap">
            <div className="eo-table-head">Recent Registrations</div>
            <table className="eo-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Participant</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_registrations.map(reg => (
                  <tr key={reg.id}>
                    <td style={{ color: "#818cf8", fontFamily: "monospace", fontSize: 12 }}>#{reg.id}</td>
                    <td style={{ color: "#f8fafc" }}>{reg.user}</td>
                    <td>
                      <span className={reg.payment_status === "paid" ? "paid-badge" : "pending-badge"}>
                        {reg.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default EventOverview;
