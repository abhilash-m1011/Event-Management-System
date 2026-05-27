import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

function Home() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animFrame;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --navy: #050818;
          --navy2: #080d2e;
          --indigo: #1e1b4b;
          --purple: #6d28d9;
          --violet: #7c3aed;
          --electric: #818cf8;
          --glow: #a78bfa;
          --soft: #c4b5fd;
          --white: #f8fafc;
          --muted: #94a3b8;
          --border: rgba(139,92,246,0.15);
        }

        .home-root {
          min-height: 100vh;
          background: var(--navy);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .home-canvas {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .home-root::before {
          content: '';
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 600px;
          background: radial-gradient(ellipse at center, rgba(109,40,217,0.18) 0%, transparent 70%);
          z-index: 1;
          pointer-events: none;
        }

        .home-root::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--violet), var(--electric), var(--violet), transparent);
          z-index: 10;
        }

        .home-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          padding: 22px 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
          background: rgba(5,8,24,0.6);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .home-logo {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--white);
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-dot {
          width: 8px; height: 8px;
          background: var(--electric);
          border-radius: 50%;
          box-shadow: 0 0 12px var(--electric);
          animation: blink 2s ease infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .home-hero {
          position: relative;
          z-index: 5;
          text-align: center;
          padding: 0 24px;
          max-width: 780px;
          animation: fadeUp 0.9s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(109,40,217,0.15);
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 100px;
          padding: 6px 18px;
          font-size: 11px;
          font-weight: 500;
          color: var(--soft);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 32px;
        }

        .eyebrow-dot {
          width: 5px; height: 5px;
          background: var(--glow);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--glow);
          animation: blink 2s ease infinite;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(46px, 7vw, 80px);
          font-weight: 900;
          line-height: 1.05;
          color: var(--white);
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }

        .hero-title .accent {
          background: linear-gradient(135deg, var(--electric), var(--glow), var(--soft));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 17px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.75;
          margin-bottom: 52px;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--violet), var(--purple));
          color: white;
          border: none;
          padding: 16px 44px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          letter-spacing: 0.02em;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 30px rgba(109,40,217,0.4);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(109,40,217,0.55);
        }

        .btn-secondary {
          background: transparent;
          color: var(--soft);
          border: 1px solid rgba(139,92,246,0.35);
          padding: 16px 44px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.02em;
          backdrop-filter: blur(8px);
        }

        .btn-secondary:hover {
          border-color: var(--electric);
          color: var(--white);
          background: rgba(129,140,248,0.08);
          transform: translateY(-2px);
        }

        .stats-bar {
          position: relative;
          z-index: 5;
          display: flex;
          margin-top: 72px;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          background: rgba(8,13,46,0.7);
          backdrop-filter: blur(20px);
          animation: fadeUp 0.9s 0.3s ease both;
          opacity: 0;
        }

        .stat-item {
          padding: 28px 44px;
          text-align: center;
          flex: 1;
          border-right: 1px solid var(--border);
          transition: background 0.3s;
        }

        .stat-item:last-child { border-right: none; }
        .stat-item:hover { background: rgba(109,40,217,0.08); }

        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--electric);
          display: block;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 400;
          color: var(--muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .features-section {
          position: relative;
          z-index: 5;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          margin-top: 72px;
          width: 100%;
          max-width: 860px;
          animation: fadeUp 0.9s 0.5s ease both;
          opacity: 0;
        }

        .feature-card {
          padding: 32px 28px;
          background: rgba(8,13,46,0.5);
          border: 1px solid var(--border);
          text-align: left;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .feature-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--violet), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .feature-card:hover {
          background: rgba(109,40,217,0.1);
          border-color: rgba(139,92,246,0.35);
        }

        .feature-card:hover::after { opacity: 1; }

        .feature-icon {
          font-size: 22px;
          margin-bottom: 14px;
          display: block;
        }

        .feature-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--white);
          margin-bottom: 8px;
        }

        .feature-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.65;
          font-weight: 300;
        }

        .home-footer {
          position: relative;
          z-index: 5;
          margin-top: 56px;
          margin-bottom: 40px;
          font-size: 11px;
          color: rgba(148,163,184,0.35);
          letter-spacing: 0.1em;
          animation: fadeUp 0.9s 0.7s ease both;
          opacity: 0;
        }

        @media (max-width: 700px) {
          .home-nav { padding: 18px 24px; }
          .stats-bar { flex-direction: column; }
          .stat-item { border-right: none; border-bottom: 1px solid var(--border); }
          .features-section { grid-template-columns: 1fr; }
          .hero-title { font-size: 38px; }
        }
      `}</style>

      <div className="home-root">
        <canvas ref={canvasRef} className="home-canvas" />

        <nav className="home-nav">
          <div className="home-logo">
            <span className="logo-dot" />
            Symposium OS
          </div>
        </nav>

        <div className="home-hero">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            Event Management Platform
          </div>

          <h1 className="hero-title">
            Run Events at<br />
            <span className="accent">Enterprise Scale</span>
          </h1>

          <p className="hero-sub">
            Real-time check-ins, QR scanning, revenue tracking, and participant management — all in one unified command center.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Sign In
            </button>
            <button className="btn-secondary" onClick={() => navigate("/register")}>
              Create Account
            </button>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-num">99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">∞</span>
            <span className="stat-label">Participants</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">Live</span>
            <span className="stat-label">Real-time Sync</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">Secure</span>
            <span className="stat-label">Role-based Access</span>
          </div>
        </div>

        <div className="features-section">
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <div className="feature-title">Live Dashboard</div>
            <p className="feature-desc">WebSocket-powered real-time feed for check-ins, payments, and food collections.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📱</span>
            <div className="feature-title">QR Scanner</div>
            <p className="feature-desc">Instant participant verification via camera-based QR scanning at entry points.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <div className="feature-title">Analytics</div>
            <p className="feature-desc">Revenue charts, attendance breakdowns, and event-level performance metrics.</p>
          </div>
        </div>

        <p className="home-footer">© 2025 SYMPOSIUM OS · ALL RIGHTS RESERVED</p>
      </div>
    </>
  );
}

export default Home;
