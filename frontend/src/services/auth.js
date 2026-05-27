export const saveAuth = (data) => {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("role", data.role);
  if (data.event_id) {
    localStorage.setItem("event_id", data.event_id);
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("event_id");
  window.location.replace("/");  // ✅ replace() prevents back-button returning to protected page
};

export const getToken = () => localStorage.getItem("token");
export const getRole = () => localStorage.getItem("role");