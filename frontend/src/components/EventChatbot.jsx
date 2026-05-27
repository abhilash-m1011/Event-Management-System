import { useState, useRef, useEffect } from "react";
import API from "../services/api";

function EventChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi 👋 I'm your Event Assistant. Ask me about events, schedules, or registrations!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const suggestions = [
    "Show available events",
    "Events today?",
    "Upcoming events",
    "My registrations"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const typeMessage = (text) => {
    let i = 0;
    const interval = setInterval(() => {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "bot_typing", text: text.substring(0, i + 1) };
        return updated;
      });
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "bot", text };
          return updated;
        });
      }
    }, 14);
  };

  const sendMessage = async (msg = input) => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await API.post("/chatbot/", {
        message: msg,
        user_id: localStorage.getItem("user_id")
      });
      setMessages(prev => [...prev, { role: "bot_typing", text: "" }]);
      setLoading(false);
      typeMessage(res.data.reply);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "⚠ AI service temporarily unavailable." }]);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ── Bubble ── */
        .cb-bubble {
          position: fixed;
          bottom: 28px;
          right: 28px;
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 4px 24px rgba(109,40,217,0.5);
          z-index: 999;
          transition: all 0.25s;
          border: 1px solid rgba(139,92,246,0.4);
          animation: floatIn 0.4s ease both;
        }

        @keyframes floatIn {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .cb-bubble:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 32px rgba(109,40,217,0.65);
        }

        /* ── Window ── */
        .cb-window {
          position: fixed;
          bottom: 28px;
          right: 28px;
          width: 360px;
          height: 500px;
          background: #080d2e;
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1);
          display: flex;
          flex-direction: column;
          z-index: 999;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          transform: scale(0.92) translateY(20px);
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cb-window.open {
          transform: scale(1) translateY(0);
          opacity: 1;
          pointer-events: all;
        }

        /* Top accent */
        .cb-window::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #7c3aed, #818cf8, #7c3aed, transparent);
        }

        /* ── Header ── */
        .cb-header {
          padding: 14px 18px;
          background: rgba(5,8,24,0.9);
          border-bottom: 1px solid rgba(139,92,246,0.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .cb-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cb-avatar {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 0 12px rgba(109,40,217,0.4);
        }

        .cb-header-info {}

        .cb-header-name {
          font-size: 13px;
          font-weight: 600;
          color: #f8fafc;
          line-height: 1.2;
        }

        .cb-header-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: #22c55e;
        }

        .cb-status-dot {
          width: 5px; height: 5px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 1.5s ease infinite;
          box-shadow: 0 0 5px #22c55e;
        }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .cb-close {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
          width: 26px; height: 26px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.2s;
        }

        .cb-close:hover { background: rgba(239,68,68,0.15); }

        /* ── Messages ── */
        .cb-messages {
          flex: 1;
          overflow-y: auto;
          padding: 14px 14px 6px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          scrollbar-width: thin;
          scrollbar-color: rgba(139,92,246,0.2) transparent;
        }

        .cb-messages::-webkit-scrollbar { width: 3px; }
        .cb-messages::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 10px; }

        .cb-msg {
          max-width: 82%;
          padding: 9px 13px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.55;
          word-break: break-word;
          white-space: pre-wrap;
          animation: msgIn 0.25s ease both;
        }

        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cb-msg.user {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #f8fafc;
          margin-left: auto;
          border-bottom-right-radius: 3px;
          box-shadow: 0 2px 12px rgba(109,40,217,0.3);
        }

        .cb-msg.bot, .cb-msg.bot_typing {
          background: rgba(13,19,64,0.8);
          border: 1px solid rgba(139,92,246,0.12);
          color: #cbd5e1;
          margin-right: auto;
          border-bottom-left-radius: 3px;
        }

        /* Typing dots */
        .typing-dots {
          display: flex;
          gap: 4px;
          padding: 2px 0;
          align-items: center;
        }

        .typing-dots span {
          width: 6px; height: 6px;
          background: #818cf8;
          border-radius: 50%;
          animation: blink 1.4s infinite both;
        }

        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%   { opacity: 0.2; transform: scale(0.8); }
          20%  { opacity: 1;   transform: scale(1); }
          100% { opacity: 0.2; transform: scale(0.8); }
        }

        /* ── Suggestions ── */
        .cb-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          padding: 8px 14px;
          border-top: 1px solid rgba(139,92,246,0.08);
          flex-shrink: 0;
        }

        .cb-chip {
          font-size: 11px;
          font-weight: 400;
          padding: 5px 10px;
          border-radius: 100px;
          border: 1px solid rgba(139,92,246,0.2);
          background: rgba(129,140,248,0.06);
          color: #a78bfa;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .cb-chip:hover {
          background: rgba(129,140,248,0.14);
          border-color: rgba(129,140,248,0.35);
          color: #c4b5fd;
        }

        /* ── Input ── */
        .cb-input-row {
          display: flex;
          align-items: center;
          gap: 0;
          border-top: 1px solid rgba(139,92,246,0.12);
          padding: 10px 12px;
          flex-shrink: 0;
          background: rgba(5,8,24,0.6);
        }

        .cb-input {
          flex: 1;
          background: rgba(8,13,46,0.8);
          border: 1px solid rgba(139,92,246,0.18);
          border-radius: 8px 0 0 8px;
          padding: 10px 13px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #f8fafc;
          outline: none;
          transition: border 0.2s;
          caret-color: #818cf8;
        }

        .cb-input::placeholder { color: rgba(148,163,184,0.3); }

        .cb-input:focus { border-color: rgba(139,92,246,0.45); }

        .cb-send {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border: none;
          color: white;
          padding: 10px 16px;
          border-radius: 0 8px 8px 0;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(109,40,217,0.3);
        }

        .cb-send:hover { background: linear-gradient(135deg, #6d28d9, #5b21b6); }

        @media (max-width: 420px) {
          .cb-window { width: calc(100vw - 32px); right: 16px; }
          .cb-bubble { right: 16px; }
        }
      `}</style>

      {/* Floating bubble */}
      {!isOpen && (
        <div className="cb-bubble" onClick={() => setIsOpen(true)}>
          💬
        </div>
      )}

      {/* Chat window */}
      <div className={`cb-window ${isOpen ? "open" : ""}`}>
        <div className="cb-header">
          <div className="cb-header-left">
            <div className="cb-avatar">⚡</div>
            <div className="cb-header-info">
              <div className="cb-header-name">Event Assistant</div>
              <div className="cb-header-status">
                <span className="cb-status-dot" /> Online
              </div>
            </div>
          </div>
          <button className="cb-close" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="cb-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`cb-msg ${msg.role}`}>
              {msg.role === "bot_typing"
                ? msg.text || (
                    <div className="typing-dots">
                      <span /><span /><span />
                    </div>
                  )
                : msg.text
              }
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="cb-suggestions">
          {suggestions.map((s, i) => (
            <button key={i} className="cb-chip" onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="cb-input-row">
          <input
            className="cb-input"
            type="text"
            placeholder="Ask about events..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button className="cb-send" onClick={() => sendMessage()}>➤</button>
        </div>
      </div>
    </>
  );
}

export default EventChatbot;
