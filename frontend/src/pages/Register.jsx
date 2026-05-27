import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState("");

  const navigate = useNavigate();

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const register = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter") register(); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --navy: #050818;
          --navy2: #080d2e;
          --purple: #6d28d9;
          --violet: #7c3aed;
          --electric: #818cf8;
          --glow: #a78bfa;
          --soft: #c4b5fd;
          --white: #f8fafc;
          --muted: #94a3b8;
          --border: rgba(139,92,246,0.2);
          --border-focus: rgba(139,92,246,0.6);
        }

        .reg-root {
          min-height: 100vh;
          background: var(--navy);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
          padding: 40px 24px;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-1 { width: 500px; height: 400px; background: rgba(109,40,217,0.1); top: -100px; left: -150px; }
        .orb-2 { width: 400px; height: 400px; background: rgba(67,56,202,0.08); bottom: -100px; right: -100px; }

        .reg-root::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--violet), var(--electric), var(--violet), transparent);
          z-index: 10;
        }

        .reg-wrapper {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 440px;
          animation: fadeUp 0.7s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .reg-card {
          background: rgba(8,13,46,0.8);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 48px 44px;
          backdrop-filter: blur(30px);
          box-shadow: 0 0 80px rgba(109,40,217,0.06), 0 40px 80px rgba(0,0,0,0.4);
          position: relative;
          overflow: hidden;
        }

        .reg-card::before {
          content: '';
          position: absolute;
          top: 0; left: 20%; right: 20%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--violet), transparent);
        }

        .reg-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }

        .brand-mark {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--violet), var(--purple));
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 20px rgba(109,40,217,0.4);
        }

        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--white);
        }

        .reg-heading {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 900;
          color: var(--white);
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }

        .reg-subheading {
          font-size: 14px;
          font-weight: 300;
          color: var(--muted);
          margin-bottom: 32px;
        }

        .field-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }

        .field-group {
          margin-bottom: 16px;
        }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: var(--soft);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .field-input {
          width: 100%;
          background: rgba(5,8,24,0.7);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 13px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: var(--white);
          outline: none;
          transition: all 0.25s ease;
          caret-color: var(--electric);
        }

        .field-input::placeholder { color: rgba(148,163,184,0.35); }

        .field-input:focus {
          border-color: var(--border-focus);
          background: rgba(8,13,46,0.9);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
        }

        .pw-strength {
          display: flex;
          gap: 4px;
          margin-top: 8px;
        }

        .pw-bar {
          flex: 1;
          height: 3px;
          border-radius: 3px;
          background: rgba(139,92,246,0.15);
          transition: background 0.3s;
        }

        .pw-bar.active-weak { background: #ef4444; }
        .pw-bar.active-medium { background: #f59e0b; }
        .pw-bar.active-strong { background: #22c55e; }

        .error-msg {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 13px;
          color: #fca5a5;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .success-msg {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: 8px;
          padding: 16px;
          font-size: 14px;
          color: #86efac;
          margin-bottom: 18px;
          text-align: center;
          line-height: 1.5;
        }

        .btn-register {
          width: 100%;
          background: linear-gradient(135deg, var(--violet), var(--purple));
          color: white;
          border: none;
          padding: 16px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: all 0.3s ease;
          box-shadow: 0 4px 24px rgba(109,40,217,0.35);
          margin-top: 6px;
        }

        .btn-register:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 36px rgba(109,40,217,0.5);
        }

        .btn-register:disabled { opacity: 0.65; cursor: not-allowed; }

        .spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .reg-footer {
          margin-top: 26px;
          text-align: center;
          font-size: 14px;
          color: var(--muted);
        }

        .reg-footer span {
          color: var(--soft);
          cursor: pointer;
          font-weight: 500;
          transition: color 0.2s;
        }

        .reg-footer span:hover { color: var(--electric); }

        .back-home {
          display: block;
          text-align: center;
          font-size: 13px;
          color: rgba(148,163,184,0.35);
          cursor: pointer;
          transition: color 0.2s;
          margin-top: 18px;
        }

        .back-home:hover { color: var(--muted); }

        @media (max-width: 480px) {
          .reg-card { padding: 36px 24px; }
        }
      `}</style>

      <div className="reg-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="reg-wrapper">
          <div className="reg-card">
            <div className="reg-brand">
              <div className="brand-mark">⚡</div>
              <span className="brand-name">Symposium OS</span>
            </div>

            <h1 className="reg-heading">Create account</h1>
            <p className="reg-subheading">Join the platform as a participant</p>

            {error && <div className="error-msg"><span>⚠</span> {error}</div>}
            {success && (
              <div className="success-msg">
                ✓ Account created successfully!<br />
                <small>Redirecting you to login...</small>
              </div>
            )}

            {!success && (
              <>
                <div className="field-group">
                  <label className="field-label">Full Name</label>
                  <input
                    className="field-input"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange("name")}
                    onKeyDown={handleKey}
                    autoComplete="name"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <input
                    className="field-input"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange("email")}
                    onKeyDown={handleKey}
                    autoComplete="email"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Password</label>
                  <input
                    className="field-input"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange("password")}
                    onKeyDown={handleKey}
                    autoComplete="new-password"
                  />
                  <div className="pw-strength">
                    {[0,1,2,3].map(i => {
                      const len = form.password.length;
                      let cls = "";
                      if (len >= 6 && i === 0) cls = "active-weak";
                      if (len >= 8 && i <= 1) cls = "active-medium";
                      if (len >= 12 && i <= 3) cls = "active-strong";
                      return <div key={i} className={`pw-bar ${cls}`} />;
                    })}
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Confirm Password</label>
                  <input
                    className="field-input"
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={handleChange("confirm")}
                    onKeyDown={handleKey}
                    autoComplete="new-password"
                  />
                </div>

                <button className="btn-register" onClick={register} disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </>
            )}

            <div className="reg-footer">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")}>Sign in</span>
            </div>

            <span className="back-home" onClick={() => navigate("/")}>← Back to home</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
