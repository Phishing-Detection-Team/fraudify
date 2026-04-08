from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FeedbackCreate(BaseModel):
    subject: str = Field(..., min_length=1, max_length=255, description="Subject of the feedback")
    description: str = Field(..., min_length=1, description="Detailed description of the feedback")

class FeedbackUpdateStatus(BaseModel):
    status: str = Field(..., description="Status of the feedback (e.g., pending, reviewed, resolved)")

class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    description: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
