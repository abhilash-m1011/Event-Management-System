import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import ScannerPage from "./pages/ScannerPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ParticipantEvents from "./pages/ParticipantEvents";
import Payment from "./pages/Payment";
import ManageEvents from "./pages/ManageEvents";
import ScanHistory from "./pages/ScanHistory";
import EventDashboard from "./pages/EventDashboard";
import EventOverview from "./pages/EventOverview";
import EventAnalytics from "./pages/EventAnalytics";
import FeedbackPage from "./pages/FeedbackPage";


// =====================================================
// RequireRole — redirects to /login if not authenticated
// or if role isn't in the allowed list
// =====================================================
function RequireRole({ allowed, children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) return <Navigate to="/login" replace />;
  if (!allowed.includes(role)) return <Navigate to="/login" replace />;

  return children;
}

// =====================================================
// PublicOnly — redirects logged-in users away from
// login/register to their respective home page
// =====================================================
function PublicOnly({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) return children;

  if (role === "admin") return <Navigate to="/dashboard" replace />;

  if (role === "event_staff") {
    const eventId = localStorage.getItem("event_id");
    if (eventId) return <Navigate to={`/event/${eventId}/scanner`} replace />;
  }

  return <Navigate to="/events" replace />;
}

// =====================================================
// App
// =====================================================
function App() {
  return (
    <Router>
      <Routes>

        {/* ===================== */}
        {/* Public Routes         */}
        {/* ===================== */}
        <Route path="/" element={<Home />} />
        <Route path="/login"    element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

        {/* ===================== */}
        {/* Admin Routes          */}
        {/* ===================== */}
        <Route path="/dashboard"
          element={<RequireRole allowed={["admin"]}><Dashboard /></RequireRole>}
        />
        <Route path="/manage"
          element={<RequireRole allowed={["admin"]}><ManageEvents /></RequireRole>}
        />
        <Route path="/scan-history"
          element={<RequireRole allowed={["admin"]}><ScanHistory /></RequireRole>}
        />

        {/* ===================== */}
        {/* Legacy Scanner        */}
        {/* ===================== */}
        <Route path="/scanner"
          element={<RequireRole allowed={["admin", "scanner"]}><Scanner /></RequireRole>}
        />

        {/* ========================= */}
        {/* Event Portal (Nested)     */}
        {/* ========================= */}
        <Route
          path="/event/:eventId"
          element={
            <RequireRole allowed={["admin", "event_staff"]}>
              <EventDashboard />
            </RequireRole>
          }
        >
          <Route index element={<EventOverview />} />
          <Route path="scanner"   element={<ScannerPage />} />
          <Route path="history"   element={<ScanHistory />} />
          <Route path="analytics" element={<EventAnalytics />} />
          <Route path="/event/:eventId/analytics" element={<EventAnalytics />} />
        </Route>

        {/* ===================== */}
        {/* Participant Routes    */}
        {/* ===================== */}
        <Route path="/events"
          element={<RequireRole allowed={["participant"]}><ParticipantEvents /></RequireRole>}
        />
        <Route path="/payment/:registrationId"
          element={<RequireRole allowed={["participant"]}><Payment /></RequireRole>}
        />

        {/* ===================== */}
        {/* Fallback              */}
        {/* ===================== */}
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* ===================== */}
        {/* Feedback Route        */}
        {/* ===================== */}
        <Route path="/feedback/:event_id" element={<FeedbackPage />} />
      </Routes>
    </Router>
  );
}

export default App;