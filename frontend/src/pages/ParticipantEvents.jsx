import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { logout } from "../services/auth";
import "../styles/participant.css";
import EventChatbot from "../components/EventChatbot";

function ParticipantEvents() {

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [subEvents, setSubEvents] = useState([]);
  const [foodPlans, setFoodPlans] = useState([]);

  const [selectedSubs, setSelectedSubs] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);

  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [selectedSubs, selectedFoods]);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/events/");
      setEvents(res.data);
    } catch {
      alert("Failed to load events");
    }
  };

  const openEvent = async (event) => {

    if (event.is_ended) return;

    try {

      setSelectedEvent(event);

      const subs = await API.get(`/sub-events/${event.id}`);
      const foods = await API.get(`/food-plans/${event.id}`);

      setSubEvents(subs.data);
      setFoodPlans(foods.data);

      setSelectedSubs([]);
      setSelectedFoods([]);

    } catch {
      alert("Failed to load event details");
    }
  };

  const toggleSub = (sub) => {

    if (selectedSubs.find((s) => s.id === sub.id)) {

      setSelectedSubs(selectedSubs.filter((s) => s.id !== sub.id));

    } else {

      setSelectedSubs([...selectedSubs, sub]);

    }
  };

  const toggleFood = (food) => {

    if (selectedFoods.find((f) => f.id === food.id)) {

      setSelectedFoods(selectedFoods.filter((f) => f.id !== food.id));

    } else {

      setSelectedFoods([...selectedFoods, food]);

    }
  };

  const calculateTotal = () => {

    let total = 0;

    selectedSubs.forEach((s) => total += Number(s.price));
    selectedFoods.forEach((f) => total += Number(f.price));

    setTotalAmount(total);
  };

  const register = async () => {

    if (!selectedEvent) return;

    if (!name || !email || !phone) {
      alert("Please fill all required details");
      return;
    }

    if (totalAmount <= 0) {
      alert("Please select at least one sub event or food plan");
      return;
    }

    setLoading(true);

    try {

      const res = await API.post("/registrations/", {

        main_event_id: selectedEvent.id,

        sub_event_ids: selectedSubs.map((s) => s.id),

        food_plan_ids: selectedFoods.map((f) => f.id),

        participant_name: name,
        participant_email: email,
        participant_phone: phone,
        participant_location: location

      });

      // ⭐ IMPORTANT: this is registration_id
      const registrationId = res.data.id;

      navigate(`/payment/${registrationId}?amount=${totalAmount}`);

    } catch (err) {

      alert(err.response?.data?.detail || "Registration failed");

    }

    setLoading(false);
  };

  return (

    <div className="participant-container">

      <div className="participant-header">

        <h1>Available Events</h1>

        <button className="participant-logout" onClick={logout}>
          Logout
        </button>

      </div>

      <EventChatbot />

      {!selectedEvent && (

        <div className="events-grid">

          {events.map((event) => (

            <div
              key={event.id}
              className={`event-card ${event.is_ended ? "disabled" : ""}`}
              onClick={() => openEvent(event)}
            >

              {event.banner_url && (
                <img
                  src={`http://127.0.0.1:8000/${event.banner_url}`}
                  alt="Event Banner"
                  className="event-banner"
                />
              )}

              <h2>{event.title}</h2>
              <p>{event.description}</p>
              <p>{new Date(event.event_date).toLocaleDateString()}</p>

              {event.is_ended && (
                <span className="ended-badge">Event Ended</span>
              )}

            </div>

          ))}

        </div>
      )}

      {selectedEvent && (

        <div className="event-details-card">

          <button
            className="back-button"
            onClick={() => setSelectedEvent(null)}
          >
            ← Back
          </button>

          <h2>{selectedEvent.title}</h2>

          <h3>Sub Events</h3>

          {subEvents.map((sub) => (

            <div key={sub.id} className="option-row">

              <label>
                <input
                  type="checkbox"
                  onChange={() => toggleSub(sub)}
                />
                {sub.title}
              </label>

              <span>₹{sub.price}</span>

            </div>

          ))}

          <h3>Food Plans</h3>

          {foodPlans.map((food) => (

            <div key={food.id} className="option-row">

              <label>
                <input
                  type="checkbox"
                  onChange={() => toggleFood(food)}
                />
                {food.name}
              </label>

              <span>₹{food.price}</span>

            </div>

          ))}

          <h3>Personal Details</h3>

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div className="total-box">
            Total Amount: ₹{totalAmount}
          </div>

          <button
            className="register-button"
            onClick={register}
            disabled={loading}
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>

        </div>
      )}

    </div>
  );
}

export default ParticipantEvents;