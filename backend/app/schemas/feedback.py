from pydantic import BaseModel


class FeedbackCreate(BaseModel):

    event_id: int

    rating: int
    organization: int
    content_quality: int
    speaker_quality: int

    recommend: bool
    comment: str


class FeedbackResponse(BaseModel):

    id: int
    user_id: int
    event_id: int

    rating: int
    organization: int
    content_quality: int
    speaker_quality: int

    recommend: bool
    comment: str

    class Config:
        from_attributes = True