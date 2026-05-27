import pandas as pd
from textblob import TextBlob


def analyze_event_feedback(feedbacks):

    if not feedbacks:
        return {
            "total_feedback": 0,
            "average_rating": 0,
            "recommend_rate": 0,
            "sentiment_score": 0
        }

    data = []

    for f in feedbacks:
        data.append({
            "rating": f.rating,
            "organization": f.organization,
            "content_quality": f.content_quality,
            "speaker_quality": f.speaker_quality,
            "recommend": 1 if f.recommend else 0,
            "comment": f.comment or ""
        })

    df = pd.DataFrame(data)

    avg_rating = df["rating"].mean()
    recommend_rate = df["recommend"].mean()

    # sentiment analysis
    sentiments = []

    for comment in df["comment"]:
        polarity = TextBlob(comment).sentiment.polarity
        sentiments.append(polarity)

    sentiment_score = sum(sentiments) / len(sentiments) if sentiments else 0

    return {
        "total_feedback": len(df),
        "average_rating": round(avg_rating, 2),
        "recommend_rate": round(recommend_rate * 100, 2),
        "organization_score": round(df["organization"].mean(), 2),
        "content_score": round(df["content_quality"].mean(), 2),
        "speaker_score": round(df["speaker_quality"].mean(), 2),
        "sentiment_score": round(sentiment_score, 2)
    }


def analyze_all_events(events_feedback):

    results = []

    for event_id, feedbacks in events_feedback.items():

        if not feedbacks:
            continue

        avg_rating = sum(f.rating for f in feedbacks) / len(feedbacks)

        results.append({
            "event_id": event_id,
            "score": avg_rating
        })

    if not results:
        return {}

    best_event = max(results, key=lambda x: x["score"])
    worst_event = min(results, key=lambda x: x["score"])

    platform_avg = sum(r["score"] for r in results) / len(results)

    return {
        "best_event": best_event,
        "worst_event": worst_event,
        "platform_average": round(platform_avg, 2)
    }


def recommend_events(events_feedback):

    recommendations = []

    for event_id, feedbacks in events_feedback.items():

        if not feedbacks:
            continue

        avg_rating = sum(f.rating for f in feedbacks) / len(feedbacks)

        recommend_rate = sum(
            1 for f in feedbacks if f.recommend
        ) / len(feedbacks)

        score = (avg_rating * 0.7) + (recommend_rate * 5 * 0.3)

        recommendations.append({
            "event_id": event_id,
            "score": round(score, 2)
        })

    recommendations.sort(key=lambda x: x["score"], reverse=True)

    return recommendations[:5]



def generate_event_insights(feedbacks):

    if not feedbacks:
        return ["No feedback available yet."]

    total = len(feedbacks)

    avg_rating = sum(f.rating for f in feedbacks) / total
    avg_org = sum(f.organization for f in feedbacks) / total
    avg_content = sum(f.content_quality for f in feedbacks) / total
    avg_speaker = sum(f.speaker_quality for f in feedbacks) / total

    recommend_rate = sum(
        1 for f in feedbacks if f.recommend
    ) / total

    comments = [f.comment for f in feedbacks if f.comment]

    sentiments = [
        TextBlob(c).sentiment.polarity for c in comments
    ]

    sentiment_score = sum(sentiments) / len(sentiments) if sentiments else 0

    insights = []

    # rating insight
    if avg_rating >= 4:
        insights.append("Overall event rating is excellent.")
    elif avg_rating >= 3:
        insights.append("Event rating is average.")
    else:
        insights.append("Event rating is poor and needs improvement.")

    # organization insight
    if avg_org < 3:
        insights.append("Event organization needs improvement.")

    # content insight
    if avg_content >= 4:
        insights.append("Participants appreciated the event content.")

    # speaker insight
    if avg_speaker >= 4:
        insights.append("Speaker quality was highly rated.")

    # recommendation insight
    if recommend_rate > 0.7:
        insights.append("Most participants would recommend this event.")

    # sentiment insight
    if sentiment_score > 0:
        insights.append("Overall participant sentiment is positive.")
    else:
        insights.append("Participant sentiment is neutral or negative.")

    return insights