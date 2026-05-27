import { useEffect, useState } from "react";
import API from "../services/api";

function FoodPlanManager({ event }) {
  const [foodPlans, setFoodPlans] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [maxUsage, setMaxUsage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchFoodPlans = async () => {
    try {
      const res = await API.get(`/food-plans/${event.id}`);
      setFoodPlans(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchFoodPlans(); }, [event]);

  const resetForm = () => { setEditingId(null); setName(""); setPrice(""); setMaxUsage(""); setError(""); };

  const savePlan = async () => {
    if (!name) { setError("Name is required."); return; }
    setError(""); setLoading(true);
    try {
      const payload = { name, price: Number(price) || 0, max_usage: Number(maxUsage) || 1 };
      if (editingId) {
        await API.put(`/food-plans/${editingId}`, payload);
        setSuccess("Plan updated!");
      } else {
        await API.post(`/food-plans/${event.id}`, payload);
        setSuccess("Plan added!");
      }
      setTimeout(() => setSuccess(""), 2500);
      resetForm();
      fetchFoodPlans();
    } catch (err) { setError(err.response?.data?.detail || "Operation failed."); }
    setLoading(false);
  };

  const deletePlan = async (id) => {
    if (!window.confirm("Delete this food plan?")) return;
    try {
      await API.delete(`/food-plans/${id}`);
      fetchFoodPlans();
      if (editingId === id) resetForm();
    } catch (err) { setError(err.response?.data?.detail || "Delete failed."); }
  };

  const startEdit = (plan) => {
    setEditingId(plan.id);
    setName(plan.name);
    setPrice(plan.price);
    setMaxUsage(plan.max_usage);
    setError("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        .fpm-root { font-family: 'DM Sans', sans-serif; }

        .fpm-form {
          display: grid;
          grid-template-columns: 2fr 120px 120px auto;
          gap: 10px;
          align-items: end;
          margin-bottom: 18px;
        }

        .fpm-field { display: flex; flex-direction: column; gap: 5px; }

        .fpm-label {
          font-size: 10px;
          font-weight: 500;
          color: #c4b5fd;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .fpm-input {
          background: rgba(5,8,24,0.7);
          border: 1px solid rgba(139,92,246,0.18);
          border-radius: 7px;
          padding: 10px 13px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #f8fafc;
          outline: none;
          transition: all 0.2s;
          caret-color: #818cf8;
          width: 100%;
        }

        .fpm-input::placeholder { color: rgba(148,163,184,0.3); }
        .fpm-input:focus { border-color: rgba(139,92,246,0.5); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }

        .fpm-btn-group { display: flex; gap: 6px; align-self: end; }

        .fpm-save-btn {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s;
          white-space: nowrap;
          box-shadow: 0 3px 14px rgba(109,40,217,0.3);
        }

        .fpm-save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(109,40,217,0.45); }
        .fpm-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .fpm-cancel-btn {
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.2);
          color: #c4b5fd;
          padding: 10px 14px;
          border-radius: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .fpm-cancel-btn:hover { background: rgba(139,92,246,0.18); }

        .fpm-msg {
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .fpm-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; }
        .fpm-success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #86efac; }

        .fpm-editing-banner {
          background: rgba(129,140,248,0.08);
          border: 1px solid rgba(129,140,248,0.2);
          border-radius: 7px;
          padding: 8px 14px;
          font-size: 12px;
          color: #818cf8;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .fpm-list { display: flex; flex-direction: column; gap: 8px; }

        .fpm-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(5,8,24,0.5);
          border: 1px solid rgba(139,92,246,0.1);
          border-radius: 8px;
          padding: 12px 16px;
          transition: all 0.2s;
          gap: 12px;
        }

        .fpm-item.editing {
          border-color: rgba(129,140,248,0.3);
          background: rgba(8,13,46,0.7);
          box-shadow: 0 0 0 2px rgba(129,140,248,0.1);
        }

        .fpm-item:hover:not(.editing) { border-color: rgba(139,92,246,0.2); }

        .fpm-item-left { display: flex; align-items: center; gap: 10px; flex: 1; }

        .fpm-item-dot {
          width: 6px; height: 6px;
          background: #a78bfa;
          border-radius: 50%;
          box-shadow: 0 0 6px #a78bfa;
          flex-shrink: 0;
        }

        .fpm-item-name { font-size: 14px; color: #f8fafc; }

        .fpm-item-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .fpm-pill {
          display: inline-flex;
          align-items: center;
          background: rgba(129,140,248,0.08);
          border: 1px solid rgba(129,140,248,0.15);
          border-radius: 100px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }

        .fpm-pill.price { color: #818cf8; }
        .fpm-pill.usage { color: #a78bfa; }

        .fpm-item-actions { display: flex; gap: 6px; flex-shrink: 0; }

        .fpm-edit-btn {
          background: rgba(129,140,248,0.1);
          border: 1px solid rgba(129,140,248,0.2);
          color: #818cf8;
          padding: 5px 12px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .fpm-edit-btn:hover { background: rgba(129,140,248,0.18); }

        .fpm-del-btn {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
          color: #fca5a5;
          padding: 5px 12px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .fpm-del-btn:hover { background: rgba(239,68,68,0.15); }

        .fpm-empty {
          text-align: center;
          padding: 24px;
          color: #475569;
          font-size: 13px;
        }

        @media (max-width: 700px) {
          .fpm-form { grid-template-columns: 1fr; }
          .fpm-btn-group { flex-direction: row; }
        }
      `}</style>

      <div className="fpm-root">
        {editingId && (
          <div className="fpm-editing-banner">
            ✏ Editing plan — update fields and save, or cancel
          </div>
        )}

        <div className="fpm-form">
          <div className="fpm-field">
            <label className="fpm-label">Plan Name *</label>
            <input className="fpm-input" placeholder="e.g. Full Day Meals" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="fpm-field">
            <label className="fpm-label">Price (₹)</label>
            <input className="fpm-input" type="number" placeholder="0" value={price} onChange={e => setPrice(e.target.value)} min="0" />
          </div>
          <div className="fpm-field">
            <label className="fpm-label">Max Uses</label>
            <input className="fpm-input" type="number" placeholder="1" value={maxUsage} onChange={e => setMaxUsage(e.target.value)} min="1" />
          </div>
          <div className="fpm-btn-group">
            <button className="fpm-save-btn" onClick={savePlan} disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update" : "+ Add"}
            </button>
            {editingId && (
              <button className="fpm-cancel-btn" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </div>

        {error && <div className="fpm-msg fpm-error">⚠ {error}</div>}
        {success && <div className="fpm-msg fpm-success">✓ {success}</div>}

        <div className="fpm-list">
          {foodPlans.length === 0 ? (
            <div className="fpm-empty">No food plans added yet</div>
          ) : (
            foodPlans.map(plan => (
              <div key={plan.id} className={`fpm-item ${editingId === plan.id ? "editing" : ""}`}>
                <div className="fpm-item-left">
                  <div className="fpm-item-dot" />
                  <span className="fpm-item-name">{plan.name}</span>
                </div>
                <div className="fpm-item-meta">
                  <span className="fpm-pill price">₹{plan.price}</span>
                  <span className="fpm-pill usage">×{plan.max_usage} uses</span>
                </div>
                <div className="fpm-item-actions">
                  <button className="fpm-edit-btn" onClick={() => startEdit(plan)}>Edit</button>
                  <button className="fpm-del-btn" onClick={() => deletePlan(plan.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default FoodPlanManager;
