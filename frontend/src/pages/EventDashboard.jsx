import { useEffect, useState } from "react";
import { useParams, Outlet, NavLink, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/eventDashboard.css";

function EventDashboard() {

  const { eventId } = useParams();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const userEventId = localStorage.getItem("event_id");

  const [event, setEvent] = useState(null);

  // ⭐ Modal state
  const [showQR, setShowQR] = useState(false);

  // 🔐 Access Guard
  useEffect(() => {

    if (role !== "event_staff" && role !== "admin") {
      navigate("/login");
      return;
    }

    if (role === "event_staff" && userEventId !== eventId) {
      navigate("/login");
    }

  }, [role, eventId, userEventId, navigate]);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await API.get(`/events/${eventId}`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (

    <div className="event-wrapper">

      {/* Top Navbar */}
      <header className="top-navbar">

        <div className="navbar-left">
          <h2>{event?.title || "Event Portal"}</h2>
          <span className="event-id">ID: {eventId}</span>
        </div>

        <nav className="navbar-links">

          <NavLink to="" end>
            Dashboard
          </NavLink>

          <NavLink to="scanner">
            Scanner
          </NavLink>

          <NavLink to="history">
            Scan History
          </NavLink>

          <NavLink to="analytics">
            Analytics
          </NavLink>

          {/* ⭐ Feedback QR Button */}
          <button
            className="qr-btn"
            onClick={() => setShowQR(true)}
          >
            Feedback QR
          </button>

        </nav>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>

      </header>


      {/* ⭐ QR Modal */}
      {showQR && (

        <div className="qr-modal">

          <div className="qr-box">

            <h3>Scan to Submit Feedback</h3>

            <img
              src={`http://127.0.0.1:8000/feedback/qr/${eventId}`}
              alt="Feedback QR"
            />

            <button
              className="close-btn"
              onClick={() => setShowQR(false)}
            >
              Close
            </button>

          </div>

        </div>

      )}

      {/* Page Content */}
      <main className="page-content">
        <Outlet />
      </main>

    </div>
  );
}

export default EventDashboard;