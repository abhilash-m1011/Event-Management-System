import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../services/auth";

// Prevents logged-in users from seeing login/register pages
function PublicRoute({ children }) {
  const token = getToken();
  const role = getRole();

  if (!token || !role) {
    return children;
  }

  // Already logged in — redirect to the right place
  if (role === "admin") return <Navigate to="/dashboard" replace />;
  if (role === "event_staff") {
    const eventId = localStorage.getItem("event_id");
    if (eventId) return <Navigate to={`/event/${eventId}/scanner`} replace />;
  }

  return <Navigate to="/events" replace />;
}

export default PublicRoute;