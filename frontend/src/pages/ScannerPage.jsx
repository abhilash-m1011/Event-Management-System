import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function ScannerPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const html5QrCodeRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const role = localStorage.getItem("role");
  const userEventId = localStorage.getItem("event_id");

  useEffect(() => {
    if (!role) { navigate("/login"); return; }
    if (role === "event_staff" && userEventId !== eventId) {
      alert("Access denied");
      navigate("/login");
    }
  }, [role, eventId, userEventId, navigate]);

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      if (!isMounted || html5QrCodeRef.current) return;
      const html5QrCode = new Html5Qrcode("reader-page");
      html5QrCodeRef.current = html5QrCode;
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => { await handleScan(decodedText); }
        );
        if (isMounted) setScanning(true);
      } catch (err) { console.error(err); }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch(() => {})
          .finally(() => { html5QrCodeRef.current = null; });
      }
    };
  }, []);

  const handleScan = async (token) => {
    if (loading) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await API.post("/verify/", null, { params: { token } });
      setResult(response.data);
    } catch (error) {
      setResult({ status: "error", message: error.response?.data?.detail || "Verification failed" });
    }
    setLoading(false);
  };

  const statusTheme = {
    success: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", color: "#86efac", icon: "✅" },
    error:   { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", color: "#fca5a5", icon: "❌" },
  };
  const theme = result ? (statusTheme[result.status] || statusTheme.error) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy: #050818;
          --surface: rgba(8,13,46,0.85);
          --electric: #818cf8;
          --soft: #c4b5fd;
          --white: #f8fafc;
          --muted: #94a3b8;
          --subtle: #475569;
          --border: rgba(139,92,246,0.12);
          --border2: rgba(139,92,246,0.24);
        }

        .sp-root {
          background: var(--navy);
          font-family: 'DM Sans', sans-serif;
          padding: 24px;
          min-height: 60vh;
        }

        .sp-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 4px;
        }

        .sp-sub {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 24px;
          font-weight: 300;
        }

        .sp-grid {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .sp-camera {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          flex: 1;
          min-width: 280px;
          max-width: 440px;
          backdrop-filter: blur(20px);
          position: relative;
        }

        .sp-camera::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #7c3aed, transparent);
        }

        .sp-cam-header {
          padding: 14px 18px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sp-cam-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--soft);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .sp-live {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #86efac;
        }

        .sp-live-dot {
          width: 5px; height: 5px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 1.5s ease infinite;
          box-shadow: 0 0 5px #22c55e;
        }

        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        #reader-page { width: 100% !important; background: black; min-height: 240px; }
        #reader-page video { width: 100% !important; }
        #reader-page__dashboard_section_csr { display: none !important; }
        #reader-page__header_message { display: none !important; }
        #reader-page__dashboard { display: none !important; }

        .sp-result {
          flex: 1;
          min-width: 240px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sp-loading {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          backdrop-filter: blur(20px);
        }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(129,140,248,0.3);
          border-top-color: var(--electric);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .sp-loading-text { font-size: 13px; color: var(--muted); }

        .sp-result-card {
          border-radius: 10px;
          padding: 18px;
          border: 1px solid;
          animation: fadeUp 0.35s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sp-result-top {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .sp-result-icon { font-size: 18px; }

        .sp-result-status {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .sp-result-msg {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .sp-result-detail {
          font-size: 12px;
          margin-bottom: 4px;
          display: flex;
          gap: 6px;
        }

        .sp-idle {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 24px 18px;
          text-align: center;
          backdrop-filter: blur(20px);
        }

        .sp-idle-icon { font-size: 24px; margin-bottom: 8px; }
        .sp-idle-text { font-size: 13px; color: var(--muted); font-weight: 300; line-height: 1.6; }
      `}</style>

      <div className="sp-root">
        <div className="sp-title">QR Scanner — Event #{eventId}</div>
        <p className="sp-sub">Point camera at participant QR code to verify entry</p>

        <div className="sp-grid">
          <div className="sp-camera">
            <div className="sp-cam-header">
              <span className="sp-cam-label">Camera</span>
              {scanning && (
                <span className="sp-live">
                  <span className="sp-live-dot" /> Live
                </span>
              )}
            </div>
            <div id="reader-page" />
          </div>

          <div className="sp-result">
            {loading && (
              <div className="sp-loading">
                <div className="spinner" />
                <span className="sp-loading-text">Verifying...</span>
              </div>
            )}

            {!loading && !result && (
              <div className="sp-idle">
                <div className="sp-idle-icon">📡</div>
                <p className="sp-idle-text">Awaiting QR scan...</p>
              </div>
            )}

            {!loading && result && theme && (
              <div className="sp-result-card" style={{ background: theme.bg, borderColor: theme.border, color: theme.color }}>
                <div className="sp-result-top">
                  <span className="sp-result-icon">{theme.icon}</span>
                  <span className="sp-result-status">{result.status}</span>
                </div>
                <p className="sp-result-msg">{result.message}</p>
                {result.participant && (
                  <div className="sp-result-detail">
                    <strong>Participant:</strong> {result.participant}
                  </div>
                )}
                {result.remaining_uses !== undefined && (
                  <div className="sp-result-detail">
                    <strong>Remaining Uses:</strong> {result.remaining_uses}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
