import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function EventAnalytics() {

  const { eventId } = useParams();
  const [insights, setInsights] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {

    try {

      const res = await API.get(`/analytics/event/${eventId}`);

      setStats(res.data);
      const insightRes = await API.get(
      `/analytics/event/${eventId}/insights`
    );

    setInsights(insightRes.data.insights);

    } catch (err) {

      console.error(err);

    }

  };

  if (!stats) {
    return <h2>Loading analytics...</h2>;
  }

  const chartData = [
    { name: "Rating", value: stats.average_rating },
    { name: "Organization", value: stats.organization_score },
    { name: "Content", value: stats.content_score },
    { name: "Speaker", value: stats.speaker_score }
  ];

  return (

    <div style={{ padding: "30px" }}>

      <h2>Event Analytics</h2>

      <div style={{ display: "flex", gap: "30px", marginTop: "20px" }}>

        <div>
          <h3>Total Feedback</h3>
          <p>{stats.total_feedback}</p>
        </div>

        <div>
          <h3>Average Rating</h3>
          <p>{stats.average_rating}</p>
        </div>

        <div>
          <h3>Recommendation %</h3>
          <p>{stats.recommend_rate}%</p>
        </div>

        <div>
          <h3>Sentiment Score</h3>
          <p>{stats.sentiment_score}</p>
        </div>

      </div>


      <div style={{ width: "100%", height: 400, marginTop: 40 }}>

        <ResponsiveContainer>

          <BarChart data={chartData}>

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="value" />

          </BarChart>

        </ResponsiveContainer>

      </div>
      <div>
              <h3 style={{marginTop:40}}>AI Insights</h3>

      <ul>
        {insights.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      </div>
    </div>

  );
}

export default EventAnalytics;