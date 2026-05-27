import { useEffect, useState } from "react";
import API from "../services/api";
import { getToken, logout } from "../services/auth";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --navy: #050818;
    --surface: #080d2e;
    --surface2: #0d1340;
    --surface3: rgba(13,19,64,0.7);
    --purple: #6d28d9;
    --violet: #7c3aed;
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
    --amber: #f59e0b;
  }

  .db-root {
    min-height: 100vh;
    background: var(--navy);
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
  }

  /* ─── TOP BAR ─── */
  .db-topbar {
    height: 60px;
    background: rgba(5,8,24,0.95);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(20px);
  }

  .db-topbar::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--violet), var(--electric), var(--violet), transparent);
  }

  .db-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 700;
    color: var(--white);
  }

  .logo-mark {
    width: 30px; height: 30px;
    background: linear-gradient(135deg, var(--violet), var(--purple));
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    box-shadow: 0 0 16px rgba(109,40,217,0.4);
  }

  .db-topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .event-select {
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: 7px;
    padding: 8px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--soft);
    outline: none;
    cursor: pointer;
    transition: border 0.2s;
  }

  .event-select:focus { border-color: var(--electric); }
  .event-select option { background: var(--surface); }

  .topbar-btn {
    background: rgba(139,92,246,0.1);
    border: 1px solid var(--border2);
    border-radius: 7px;
    padding: 8px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--soft);
    cursor: pointer;
    transition: all 0.2s;
  }

  .topbar-btn:hover {
    background: rgba(139,92,246,0.18);
    border-color: var(--electric);
    color: var(--white);
  }

  .topbar-btn.danger {
    background: rgba(239,68,68,0.08);
    border-color: rgba(239,68,68,0.2);
    color: #fca5a5;
  }

  .topbar-btn.danger:hover {
    background: rgba(239,68,68,0.16);
    border-color: rgba(239,68,68,0.4);
  }

  /* ─── MAIN LAYOUT ─── */
  .db-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* ─── SIDEBAR ─── */
  .db-sidebar {
    width: 220px;
    background: rgba(8,13,46,0.95);
    border-right: 1px solid var(--border);
    padding: 24px 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sidebar-section-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--subtle);
    padding: 0 20px 8px;
    margin-top: 20px;
  }

  .sidebar-section-label:first-child { margin-top: 0; }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    font-size: 13.5px;
    font-weight: 400;
    color: var(--muted);
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: all 0.2s;
    text-decoration: none;
  }

  .sidebar-item:hover {
    color: var(--soft);
    background: rgba(139,92,246,0.06);
    border-left-color: rgba(139,92,246,0.3);
  }

  .sidebar-item.active {
    color: var(--electric);
    background: rgba(129,140,248,0.08);
    border-left-color: var(--electric);
    font-weight: 500;
  }

  .sidebar-icon { font-size: 15px; width: 18px; text-align: center; }

  /* ─── CONTENT ─── */
  .db-content {
    flex: 1;
    overflow-y: auto;
    padding: 28px 32px;
    scrollbar-width: thin;
    scrollbar-color: var(--border2) transparent;
  }

  .db-content::-webkit-scrollbar { width: 5px; }
  .db-content::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 10px; }

  .page-header {
    margin-bottom: 28px;
  }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 900;
    color: var(--white);
    letter-spacing: -0.01em;
    margin-bottom: 4px;
  }

  .page-subtitle {
    font-size: 13px;
    color: var(--muted);
    font-weight: 300;
  }

  /* ─── STAT CARDS ─── */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    margin-bottom: 28px;
  }

  @media (max-width: 1200px) { .stat-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 700px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }

  .stat-card {
    background: var(--surface3);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 20px 18px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    backdrop-filter: blur(20px);
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--violet), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .stat-card:hover {
    border-color: var(--border2);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
  }

  .stat-card:hover::before { opacity: 1; }

  .stat-icon {
    font-size: 18px;
    margin-bottom: 12px;
    display: block;
  }

  .stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--white);
    line-height: 1;
    margin-bottom: 6px;
  }

  .stat-label {
    font-size: 11px;
    font-weight: 400;
    color: var(--muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .stat-card.revenue .stat-value { color: var(--electric); }
  .stat-card.success .stat-value { color: var(--green); }

  /* ─── GRID LAYOUT ─── */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 20px;
    margin-bottom: 20px;
  }

  @media (max-width: 1100px) { .dashboard-grid { grid-template-columns: 1fr; } }

  /* ─── PANEL ─── */
  .panel {
    background: var(--surface3);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    backdrop-filter: blur(20px);
  }

  .panel-header {
    padding: 18px 22px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--white);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .panel-badge {
    background: rgba(129,140,248,0.15);
    color: var(--electric);
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 100px;
    font-weight: 500;
    border: 1px solid rgba(129,140,248,0.2);
  }

  .panel-body { padding: 22px; }

  /* ─── LIVE FEED ─── */
  .live-feed-scroll {
    max-height: 280px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .live-feed-scroll::-webkit-scrollbar { width: 3px; }
  .live-feed-scroll::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 10px; }

  .live-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(139,92,246,0.06);
    animation: slideIn 0.35s ease;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .live-item:last-child { border-bottom: none; }

  .live-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
  }

  .dot-payment { background: var(--green); box-shadow: 0 0 6px var(--green); }
  .dot-checkin { background: var(--electric); box-shadow: 0 0 6px var(--electric); }
  .dot-food { background: var(--amber); box-shadow: 0 0 6px var(--amber); }
  .dot-default { background: var(--muted); }

  .live-type {
    font-size: 12px;
    font-weight: 500;
    color: var(--soft);
    margin-bottom: 2px;
  }

  .live-detail {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--subtle);
  }

  .live-empty {
    text-align: center;
    padding: 32px 0;
    color: var(--subtle);
    font-size: 13px;
  }

  .live-pulse {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--green);
  }

  .pulse-dot {
    width: 6px; height: 6px;
    background: var(--green);
    border-radius: 50%;
    animation: pulse 1.5s ease infinite;
    box-shadow: 0 0 6px var(--green);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }

  /* ─── CHART ─── */
  .charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  @media (max-width: 900px) { .charts-row { grid-template-columns: 1fr; } }

  /* ─── TABLE ─── */
  .reg-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .reg-table th {
    padding: 10px 14px;
    text-align: left;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--subtle);
    border-bottom: 1px solid var(--border);
  }

  .reg-table td {
    padding: 12px 14px;
    color: var(--muted);
    border-bottom: 1px solid rgba(139,92,246,0.05);
    font-size: 13px;
  }

  .reg-table tr:last-child td { border-bottom: none; }

  .reg-table tbody tr {
    transition: background 0.2s;
  }

  .reg-table tbody tr:hover {
    background: rgba(139,92,246,0.04);
  }

  .reg-table td:first-child {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: var(--electric);
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 500;
  }

  .status-paid {
    background: rgba(34,197,94,0.12);
    color: #86efac;
    border: 1px solid rgba(34,197,94,0.2);
  }

  .status-pending {
    background: rgba(245,158,11,0.1);
    color: #fcd34d;
    border: 1px solid rgba(245,158,11,0.2);
  }

  .status-dot { width: 5px; height: 5px; border-radius: 50%; }
  .status-paid .status-dot { background: var(--green); }
  .status-pending .status-dot { background: var(--amber); }

  /* ─── TOOLTIP ─── */
  .custom-tooltip {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 8px;
    padding: 10px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--white);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>{label}</div>
        <div style={{ color: "var(--electric)", fontWeight: 600 }}>
          {payload[0].name === "amount" ? `₹${payload[0].value}` : payload[0].value}
        </div>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    total_registrations: 0,
    checked_in: 0,
    pending_check_in: 0,
    food_collections: 0,
    total_revenue: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    API.get("/events/").then(res => {
      setEvents(res.data);
      if (res.data.length > 0) setSelectedEventId(res.data[0].id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;

    API.get(`/admin/dashboard/main-event/${selectedEventId}`)
      .then(res => {
        setStats(res.data);
        setRecentRegistrations(res.data.recent_registrations || []);
      }).catch(console.error);

    const token = getToken();
    if (!token) return;

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/dashboard?token=${token}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLiveEvents(prev => [{ id: Date.now(), ...data }, ...prev.slice(0, 19)]);
      setStats(prev => {
        const u = { ...prev };
        if (data.type === "payment_success") { u.total_revenue += data.amount || 0; u.total_registrations += 1; }
        if (data.type === "event_checkin") u.checked_in += 1;
        if (data.type === "food_collected") u.food_collections += 1;
        return u;
      });
    };
    return () => ws.close();
  }, [selectedEventId]);

  const pieData = [
    { name: "Checked In", value: stats.checked_in },
    { name: "Pending", value: stats.pending_check_in },
  ];

  const barData = [{ name: "Revenue", amount: stats.total_revenue }];

  const getDotClass = (type) => {
    if (type === "payment_success") return "dot-payment";
    if (type === "event_checkin") return "dot-checkin";
    if (type === "food_collected") return "dot-food";
    return "dot-default";
  };

  const sidebarItems = [
    { icon: "⬛", label: "Overview", tab: "overview" },
    { icon: "📊", label: "Analytics", tab: "analytics" },
    { icon: "🏷", label: "Manage Events", action: () => navigate("/manage") },
    { icon: "📋", label: "Scan History", action: () => navigate("/scan-history") },
    { icon: "📱", label: "Scanner", action: () => navigate("/scanner") },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="db-root">

        {/* TOP BAR */}
        <div className="db-topbar">
          <div className="db-logo">
            <div className="logo-mark">⚡</div>
            Symposium OS
          </div>
          <div className="db-topbar-right">
            <select
              className="event-select"
              value={selectedEventId || ""}
              onChange={(e) => setSelectedEventId(Number(e.target.value))}
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
            <button className="topbar-btn danger" onClick={logout}>Sign Out</button>
          </div>
        </div>

        <div className="db-body">
          {/* SIDEBAR */}
          <div className="db-sidebar">
            <div className="sidebar-section-label">Navigation</div>
            {sidebarItems.map((item) => (
              <div
                key={item.label}
                className={`sidebar-item ${activeTab === item.tab ? "active" : ""}`}
                onClick={item.action || (() => setActiveTab(item.tab))}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          {/* CONTENT */}
          <div className="db-content">
            <div className="page-header">
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-subtitle">Real-time event monitoring and management</p>
            </div>

            {/* STAT CARDS */}
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-icon">👥</span>
                <div className="stat-value">{stats.total_registrations}</div>
                <div className="stat-label">Registrations</div>
              </div>
              <div className="stat-card success">
                <span className="stat-icon">✅</span>
                <div className="stat-value">{stats.checked_in}</div>
                <div className="stat-label">Checked In</div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⏳</span>
                <div className="stat-value">{stats.pending_check_in}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🍽</span>
                <div className="stat-value">{stats.food_collections}</div>
                <div className="stat-label">Food Collected</div>
              </div>
              <div className="stat-card revenue">
                <span className="stat-icon">💰</span>
                <div className="stat-value">₹{stats.total_revenue.toLocaleString()}</div>
                <div className="stat-label">Revenue</div>
              </div>
            </div>

            {/* MAIN GRID */}
            <div className="dashboard-grid">
              {/* Charts Column */}
              <div className="charts-row" style={{ marginBottom: 0 }}>
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Attendance Split</div>
                  </div>
                  <div className="panel-body">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" outerRadius={85} innerRadius={45} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                          <Cell fill="#22c55e" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Revenue</div>
                  </div>
                  <div className="panel-body">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={barData} barSize={48}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(129,140,248,0.05)" }} />
                        <Bar dataKey="amount" fill="url(#barGrad)" radius={[6,6,0,0]} />
                        <defs>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#6d28d9" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Live Feed */}
              <div className="panel" style={{ height: "fit-content" }}>
                <div className="panel-header">
                  <div className="panel-title">
                    Live Feed
                    <span className="panel-badge">LIVE</span>
                  </div>
                  <div className="live-pulse">
                    <div className="pulse-dot" />
                    Active
                  </div>
                </div>
                <div className="panel-body" style={{ padding: "16px 20px" }}>
                  <div className="live-feed-scroll">
                    {liveEvents.length === 0 ? (
                      <div className="live-empty">
                        <div style={{ fontSize: 24, marginBottom: 8 }}>📡</div>
                        Waiting for activity...
                      </div>
                    ) : (
                      liveEvents.map(ev => (
                        <div key={ev.id} className="live-item">
                          <div className={`live-dot ${getDotClass(ev.type)}`} />
                          <div>
                            <div className="live-type">{ev.type?.replace(/_/g, " ").toUpperCase()}</div>
                            <div className="live-detail">ID: {ev.registration_id}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT REGISTRATIONS */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Recent Registrations</div>
                <span className="panel-badge">{recentRegistrations.length} entries</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="reg-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Participant</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRegistrations.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: "center", padding: 32, color: "var(--subtle)" }}>No registrations yet</td></tr>
                    ) : (
                      recentRegistrations.map(reg => (
                        <tr key={reg.id}>
                          <td>#{reg.id}</td>
                          <td style={{ color: "var(--white)" }}>{reg.user}</td>
                          <td>
                            <span className={`status-badge ${reg.payment_status === "paid" ? "status-paid" : "status-pending"}`}>
                              <span className="status-dot" />
                              {reg.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
