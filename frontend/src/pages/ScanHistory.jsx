import { useEffect, useState } from "react";
import API from "../services/api";
import AdminNavbar from "../components/AdminNavbar";

function ScanHistory() {
  const [logs, setLogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ total: 0, success: 0, duplicate: 0, failed: 0 });

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [statusFilter, typeFilter]);

  const fetchLogs = async () => {
    if (loading) return;
    setLoading(true);
    try {
      let url = "/verify/history";
      const params = [];
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (typeFilter) params.push(`scan_type=${typeFilter}`);
      if (params.length > 0) url += "?" + params.join("&");

      const res = await API.get(url);
      const logsData = res.data;
      setLogs(logsData);
      setSummary({
        total: logsData.length,
        success: logsData.filter(l => l.status === "success").length,
        duplicate: logsData.filter(l => l.status === "duplicate").length,
        failed: logsData.filter(l => ["expired", "invalid", "limit_reached"].includes(l.status)).length,
      });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const exportCSV = async () => {
    try {
      let url = "/verify/history/export";
      const params = [];
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (typeFilter) params.push(`scan_type=${typeFilter}`);
      if (params.length > 0) url += "?" + params.join("&");
      const response = await API.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "scan_history.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) { console.error("CSV download failed", error); }
  };

  const getStatusTheme = (status) => {
    if (status === "success") return { bg: "rgba(34,197,94,0.1)", color: "#86efac", border: "rgba(34,197,94,0.2)" };
    if (status === "duplicate") return { bg: "rgba(245,158,11,0.1)", color: "#fcd34d", border: "rgba(245,158,11,0.2)" };
    return { bg: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "rgba(239,68,68,0.2)" };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy: #050818;
          --surface: rgba(8,13,46,0.8);
          --violet: #7c3aed;
          --electric: #818cf8;
          --soft: #c4b5fd;
          --white: #f8fafc;
          --muted: #94a3b8;
          --subtle: #475569;
          --border: rgba(139,92,246,0.12);
          --border2: rgba(139,92,246,0.24);
        }

        .sh-root {
          min-height: 100vh;
          background: var(--navy);
          font-family: 'DM Sans', sans-serif;
        }

        .sh-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px;
        }

        .sh-header { margin-bottom: 28px; }

        .sh-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 900;
          color: var(--white);
          margin-bottom: 4px;
        }

        .sh-subtitle {
          font-size: 13px;
          color: var(--muted);
          font-weight: 300;
        }

        /* Summary cards */
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        @media (max-width: 900px) { .summary-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 500px) { .summary-grid { grid-template-columns: 1fr; } }

        .sum-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px 20px 18px;
          backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;
          transition: border-color 0.25s;
        }

        .sum-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
        }

        .sum-card.total::before { background: linear-gradient(90deg, #818cf8, #7c3aed); }
        .sum-card.success::before { background: linear-gradient(90deg, #22c55e, #16a34a); }
        .sum-card.duplicate::before { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .sum-card.failed::before { background: linear-gradient(90deg, #ef4444, #dc2626); }

        .sum-card:hover { border-color: var(--border2); }

        .sum-num {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          font-weight: 700;
          display: block;
          margin-bottom: 5px;
        }

        .sum-card.total .sum-num { color: var(--electric); }
        .sum-card.success .sum-num { color: #86efac; }
        .sum-card.duplicate .sum-num { color: #fcd34d; }
        .sum-card.failed .sum-num { color: #fca5a5; }

        .sum-label {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* Toolbar */
        .sh-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .sh-select {
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: 7px;
          padding: 8px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: var(--soft);
          outline: none;
          cursor: pointer;
          transition: border 0.2s;
          backdrop-filter: blur(20px);
        }

        .sh-select:focus { border-color: var(--electric); }
        .sh-select option { background: #080d2e; }

        .sh-btn {
          padding: 8px 18px;
          border-radius: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid;
        }

        .sh-btn-refresh {
          background: rgba(129,140,248,0.1);
          border-color: rgba(129,140,248,0.25);
          color: var(--electric);
        }

        .sh-btn-refresh:hover {
          background: rgba(129,140,248,0.18);
          border-color: var(--electric);
        }

        .sh-btn-export {
          background: rgba(34,197,94,0.1);
          border-color: rgba(34,197,94,0.25);
          color: #86efac;
        }

        .sh-btn-export:hover {
          background: rgba(34,197,94,0.18);
          border-color: rgba(34,197,94,0.5);
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #86efac;
          margin-left: auto;
        }

        .live-dot {
          width: 6px; height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 1.5s ease infinite;
          box-shadow: 0 0 6px #22c55e;
        }

        @keyframes pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Table */
        .sh-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          backdrop-filter: blur(20px);
        }

        .sh-panel-header {
          padding: 16px 22px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sh-panel-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--soft);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .sh-count {
          font-size: 11px;
          color: var(--subtle);
        }

        .sh-table-wrap { overflow-x: auto; }

        .sh-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .sh-table th {
          padding: 10px 16px;
          text-align: left;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--subtle);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }

        .sh-table td {
          padding: 12px 16px;
          color: var(--muted);
          border-bottom: 1px solid rgba(139,92,246,0.05);
          white-space: nowrap;
        }

        .sh-table tr:last-child td { border-bottom: none; }

        .sh-table tbody tr { transition: background 0.2s; }
        .sh-table tbody tr:hover { background: rgba(139,92,246,0.04); }

        .sh-table td:first-child {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: var(--electric);
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 500;
          border: 1px solid;
        }

        .status-dot { width: 5px; height: 5px; border-radius: 50%; }

        .type-pill {
          display: inline-flex;
          align-items: center;
          background: rgba(129,140,248,0.08);
          border: 1px solid rgba(129,140,248,0.15);
          color: var(--electric);
          padding: 3px 10px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 500;
        }

        .sh-empty {
          text-align: center;
          padding: 60px;
          color: var(--subtle);
        }

        .sh-empty-icon { font-size: 32px; margin-bottom: 10px; }

        .loading-bar {
          height: 2px;
          background: linear-gradient(90deg, var(--violet), var(--electric));
          animation: shimmer 1.2s ease infinite;
          transform-origin: left;
        }

        @keyframes shimmer {
          0% { transform: scaleX(0); opacity: 1; }
          100% { transform: scaleX(1); opacity: 0; }
        }

        @media (max-width: 600px) { .sh-body { padding: 20px 16px; } }
      `}</style>

      <div className="sh-root">
        <AdminNavbar />
        <div className="sh-body">
          <div className="sh-header">
            <h1 className="sh-title">Scan History</h1>
            <p className="sh-subtitle">Real-time log of all QR verification events</p>
          </div>

          {/* Summary */}
          <div className="summary-grid">
            {[
              { key: "total", label: "Total Scans", val: summary.total },
              { key: "success", label: "Successful", val: summary.success },
              { key: "duplicate", label: "Duplicate", val: summary.duplicate },
              { key: "failed", label: "Failed / Expired", val: summary.failed },
            ].map(({ key, label, val }) => (
              <div key={key} className={`sum-card ${key}`}>
                <span className="sum-num">{val}</span>
                <span className="sum-label">{label}</span>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="sh-toolbar">
            <select className="sh-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="duplicate">Duplicate</option>
              <option value="expired">Expired</option>
              <option value="limit_reached">Limit Reached</option>
            </select>

            <select className="sh-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="event">Event</option>
              <option value="food">Food</option>
            </select>

            <button className="sh-btn sh-btn-refresh" onClick={fetchLogs}>↻ Refresh</button>
            <button className="sh-btn sh-btn-export" onClick={exportCSV}>↓ Export CSV</button>

            <div className="live-badge">
              <div className="live-dot" />
              Auto-refreshing
            </div>
          </div>

          {/* Table */}
          <div className="sh-panel">
            <div className="sh-panel-header">
              <div className="sh-panel-title">Scan Log</div>
              <div className="sh-count">{logs.length} entries</div>
            </div>

            {loading && <div className="loading-bar" />}

            <div className="sh-table-wrap">
              <table className="sh-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Registration</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Scanned By</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="sh-empty">
                          <div className="sh-empty-icon">📋</div>
                          No scan records found
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map(log => {
                      const theme = getStatusTheme(log.status);
                      return (
                        <tr key={log.id}>
                          <td>#{log.id}</td>
                          <td style={{ color: "var(--white)" }}>{log.registration_id}</td>
                          <td>
                            <span className="type-pill">{log.scan_type}</span>
                          </td>
                          <td>
                            <span className="status-pill" style={{ background: theme.bg, color: theme.color, borderColor: theme.border }}>
                              <span className="status-dot" style={{ background: theme.color }} />
                              {log.status}
                            </span>
                          </td>
                          <td>{log.scanned_by}</td>
                          <td style={{ fontFamily: "DM Mono, monospace", fontSize: 12 }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ScanHistory;
