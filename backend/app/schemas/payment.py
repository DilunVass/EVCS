from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any
from datetime import datetime
from bson import ObjectId

class PaymentMethod(BaseModel):
    """Schema for payment method information."""
    type: Literal["credit_card", "debit_card", "digital_wallet", "bank_transfer"]
    provider: Optional[str] = None  # e.g., "Visa", "PayPal", etc.
    last_four_digits: Optional[str] = None
    expiry_month: Optional[int] = None
    expiry_year: Optional[int] = None
    is_default: bool = False

class Payment(BaseModel):
    """Schema for payment data."""
    id: Optional[str] = None
    session_id: str
    user_id: str
    amount: float = Field(gt=0, description="Payment amount")
    currency: str = Field(default="USD", description="Payment currency")
    payment_method: PaymentMethod
    status: Literal["pending", "processing", "completed", "failed", "cancelled", "refunded"] = "pending"
    transaction_id: Optional[str] = None
    gateway_response: Optional[Dict[str, Any]] = None
    failure_reason: Optional[str] = None
    processed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Encrypted fields (will be stored encrypted in database)
    encrypted_card_number: Optional[str] = None
    encrypted_cvv: Optional[str] = None
    encrypted_cardholder_name: Optional[str] = None

    class Config:
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat() if v else None
        }
        allow_population_by_field_name = True
        arbitrary_types_allowed = True

class PaymentCreate(BaseModel):
    """Schema for creating a payment."""
    session_id: str
    amount: float = Field(gt=0)
    currency: str = "USD"
    payment_method: PaymentMethod
    
    # Sensitive data (will be encrypted before storage)
    card_number: Optional[str] = None
    cvv: Optional[str] = None
    cardholder_name: Optional[str] = None

class PaymentUpdate(BaseModel):
    """Schema for updating payment status."""
    status: Optional[Literal["pending", "processing", "completed", "failed", "cancelled", "refunded"]] = None
    transaction_id: Optional[str] = None
    gateway_response: Optional[Dict[str, Any]] = None
    failure_reason: Optional[str] = None
    processed_at: Optional[datetime] = None

class PaymentResponse(BaseModel):
    """Schema for returning payment details (admin only)."""
    id: str
    session_id: str
    user_id: str
    amount: float
    currency: str
    payment_method: PaymentMethod
    status: str
    transaction_id: Optional[str] = None
    failure_reason: Optional[str] = None
    processed_at: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class PaymentHistory(BaseModel):
    """Schema for payment history (admin view)."""
    payments: list[PaymentResponse]
    total_payments: int
    total_amount: float
    successful_payments: int
    failed_payments: int
    pending_payments: int

class UserPaymentSummary(BaseModel):
    """Schema for user's payment summary (limited view)."""
    id: str
    session_id: str
    amount: float
    currency: str
    status: str
    created_at: Optional[str] = None
    # Note: No sensitive payment method details for user view

class RefundRequest(BaseModel):
    """Schema for refund requests."""
    payment_id: str
    reason: str
    amount: Optional[float] = None  # Partial refund amount, None for full refund

class RefundResponse(BaseModel):
    """Schema for refund response."""
    id: str
    payment_id: str
    amount: float
    reason: str
    status: Literal["pending", "approved", "rejected", "processed"]
    created_at: str
    processed_at: Optional[str] = None