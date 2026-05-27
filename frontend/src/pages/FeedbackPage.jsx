import { useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import "../styles/feedback.css";

function FeedbackPage() {

  const { eventId } = useParams();

  const [rating, setRating] = useState(5);
  const [contentQuality, setContentQuality] = useState(5);
const [speakerQuality, setSpeakerQuality] = useState(5);
const [recommend, setRecommend] = useState(true);
  const [organization, setOrganization] = useState(5);
  const [comment, setComment] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = async () => {

    try {

      await API.post("/feedback/", {
        event_id: eventId,
        rating,
        organization,
        content_quality: contentQuality,
        speaker_quality: speakerQuality,
        recommend,
        comment
        });

      setSubmitted(true);

    } catch (err) {

      alert("Failed to submit feedback");

    }
  };

  if (submitted) {
    return (
      <div className="feedback-container">
        <h2>✅ Thank you for your feedback!</h2>
      </div>
    );
  }

  return (

    <div className="feedback-container">

      <div className="feedback-box">

        <h2>Event Feedback</h2>

        <label>Overall Rating</label>
        <input
          type="range"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        />

        <label>Content Quality</label>
        <input
          type="range"
          min="1"
          max="5"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        />

        <label>Speaker Quality</label>
        <input
          type="range"
          min="1"
          max="5"
          value={food}
          onChange={(e) => setFood(e.target.value)}
        />

        <label>Organization</label>
        <input
          type="range"
          min="1"
          max="5"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
        />

        <label>Comments</label>
        <textarea
          placeholder="Tell us about your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <label>Would you recommend this event?</label>

        <select
        value={recommend}
        onChange={(e) => setRecommend(e.target.value === "true")}
        >
        <option value="true">Yes</option>
        <option value="false">No</option>
        </select>

        <button onClick={submitFeedback}>
          Submit Feedback
        </button>

      </div>

    </div>

  );
}

export default FeedbackPage;