import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import API from "../services/api";

function Scanner() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const html5QrCodeRef = useRef(null);
  const lastScannedRef = useRef(null);
  const scanLockRef = useRef(false);

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []);

  const startScanner = async () => {
    if (scanning) return;
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCodeRef.current = html5QrCode;
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          aspectRatio: 1.777,
          qrbox: (w, h) => {
            const size = Math.floor(Math.min(w, h) * 0.6);
            return { width: size, height: size };
          }
        },
        async (decodedText) => {
          if (scanLockRef.current) return;
          if (lastScannedRef.current === decodedText) return;
          lastScannedRef.current = decodedText;
          scanLockRef.current = true;
          await handleScan(decodedText);
        }
      );
      setScanning(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Scanner stop error:", err);
      }
      setScanning(false);
    }
  };

  const handleScan = async (decodedText) => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await API.post(`/verify/?token=${decodedText}`);
      setResponse(res.data);
    } catch (err) {
      setResponse({
        status: "error",
        message: err.response?.data?.detail || "Verification failed"
      });
    }
    setLoading(false);
    setTimeout(() => { scanLockRef.current = false; }, 2000);
  };

  const statusColor = {
    success: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", text: "#86efac", icon: "✅" },
    error: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", text: "#fca5a5", icon: "❌" },
    already_scanned: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", text: "#fcd34d", icon: "⚠" },
  };

  const theme = response ? (statusColor[response.status] || statusColor.error) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy: #050818;
          --surface: rgba(8,13,46,0.85);
          --violet: #7c3aed;
          --purple: #6d28d9;
          --electric: #818cf8;
          --soft: #c4b5fd;
          --white: #f8fafc;
          --muted: #94a3b8;
          --subtle: #475569;
          --border: rgba(139,92,246,0.12);
          --border2: rgba(139,92,246,0.24);
        }

        .scanner-root {
          min-height: 100vh;
          background: var(--navy);
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .scanner-topbar {
          height: 60px;
          background: rgba(5,8,24,0.97);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          backdrop-filter: blur(20px);
          position: relative;
        }

        .scanner-topbar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #7c3aed, #818cf8, #7c3aed, transparent);
        }

        .scanner-logo {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--white);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .scanner-logo-mark {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          box-shadow: 0 0 14px rgba(109,40,217,0.4);
        }

        .scanner-logout {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
          padding: 7px 16px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .scanner-logout:hover { background: rgba(239,68,68,0.15); }

        .scanner-body {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 24px;
          gap: 28px;
          flex-wrap: wrap;
        }

        /* Camera panel */
        .camera-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(20px);
          width: 100%;
          max-width: 480px;
          position: relative;
        }

        .camera-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--violet), transparent);
        }

        .camera-header {
          padding: 18px 22px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .camera-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--white);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .scan-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--muted);
        }

        .scan-status.live { color: #86efac; }

        .status-pulse {
          width: 6px; height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 1.5s ease infinite;
          box-shadow: 0 0 6px #22c55e;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        #reader {
          width: 100% !important;
          background: black;
          min-height: 280px;
        }

        #reader video { width: 100% !important; }

        /* Hide html5-qrcode branding */
        #reader__dashboard_section_csr { display: none !important; }
        #reader__header_message { display: none !important; }
        #reader__dashboard { display: none !important; }

        /* Result panel */
        .result-panel {
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .result-card {
          border-radius: 12px;
          padding: 22px 22px;
          border: 1px solid;
          animation: fadeUp 0.4s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .result-status-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .result-icon { font-size: 20px; }

        .result-status-text {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .result-message {
          font-size: 14px;
          font-weight: 300;
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .result-participant {
          font-size: 13px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .result-participant strong { font-weight: 600; }

        .token-box {
          margin-top: 10px;
        }

        .token-label {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 6px;
          opacity: 0.6;
        }

        .token-textarea {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--muted);
          resize: none;
          outline: none;
        }

        /* Loading */
        .scan-loading {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          backdrop-filter: blur(20px);
        }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(139,92,246,0.3);
          border-top-color: var(--electric);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-text {
          font-size: 14px;
          color: var(--muted);
        }

        /* Idle hint */
        .idle-hint {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          backdrop-filter: blur(20px);
        }

        .idle-icon { font-size: 28px; margin-bottom: 10px; }

        .idle-text {
          font-size: 14px;
          color: var(--muted);
          font-weight: 300;
          line-height: 1.6;
        }

        @media (max-width: 600px) {
          .scanner-body { padding: 20px 16px; }
          .result-panel { max-width: 100%; }
        }
      `}</style>

      <div className="scanner-root">
        <div className="scanner-topbar">
          <div className="scanner-logo">
            <span className="scanner-logo-mark">📱</span>
            QR Scanner
          </div>
          <button className="scanner-logout" onClick={() => { localStorage.clear(); window.location.href = "/"; }}>
            Sign Out
          </button>
        </div>

        <div className="scanner-body">
          {/* Camera */}
          <div className="camera-panel">
            <div className="camera-header">
              <div className="camera-title">Live Camera</div>
              <div className={`scan-status ${scanning ? "live" : ""}`}>
                {scanning && <span className="status-pulse" />}
                {scanning ? "Scanning" : "Starting..."}
              </div>
            </div>
            <div id="reader" />
          </div>

          {/* Result */}
          <div className="result-panel">
            {loading && (
              <div className="scan-loading">
                <div className="spinner" />
                <span className="loading-text">Verifying QR code...</span>
              </div>
            )}

            {!loading && !response && (
              <div className="idle-hint">
                <div className="idle-icon">📡</div>
                <p className="idle-text">Point the camera at a participant's QR code to verify their entry.</p>
              </div>
            )}

            {!loading && response && theme && (
              <div className="result-card" style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}>
                <div className="result-status-row">
                  <span className="result-icon">{theme.icon}</span>
                  <span className="result-status-text">{response.status.replace(/_/g, " ")}</span>
                </div>

                <p className="result-message">{response.message}</p>

                {response.participant && (
                  <div className="result-participant">
                    <strong>Participant:</strong> {response.participant}
                  </div>
                )}

                {response.scanned_token && (
                  <div className="token-box">
                    <div className="token-label">Scanned Token</div>
                    <textarea
                      className="token-textarea"
                      value={response.scanned_token}
                      readOnly
                      rows={3}
                    />
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

export default Scanner;
