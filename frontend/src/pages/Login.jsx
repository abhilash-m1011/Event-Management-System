import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { saveAuth, getToken, getRole } from "../services/auth";
import "../styles/auth.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();



  const login = async () => {

    if (loading) return;

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    try {

      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await API.post(
        "/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );

      const { role, event_id } = res.data;

      // ✅ saveAuth now also handles event_id internally
      saveAuth(res.data);

      // Role-based routing
      if (role === "admin") {
        navigate("/dashboard");
        return;
      }

      if (role === "event_staff") {
        if (!event_id) {
          alert("Event staff not linked to any event.");
          setLoading(false);
          return;
        }
        navigate(`/event/${event_id}/scanner`);
        return;
      }

      // Participant
      navigate("/events");

    } catch (err) {

      console.error(err);

      alert(
        err?.response?.data?.detail ||
        "Login failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="auth-container">

      <div className="auth-box">

        <h2>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") login();
          }}
        />

        <button onClick={login} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ marginTop: 15 }}>
          Don't have an account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>

      </div>

    </div>

  );
}

export default Login;