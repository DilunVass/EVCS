from pydantic import BaseModel, Field, field_serializer, validator
from typing import Optional, Literal, Dict, Any, Union, List
from datetime import datetime
from bson import ObjectId
from app.database import payments_collection, charging_sessions_collection, refunds_collection
from app.utils.datetime_converter import prepare_response_data
from cryptography.fernet import Fernet
import os
import secrets
import string

class PaymentMethod(BaseModel):
    """Schema for payment method information."""
    type: Literal["credit_card", "debit_card", "digital_wallet", "bank_transfer"]
    provider: Optional[str] = None
    last_four_digits: Optional[str] = Field(None, min_length=4, max_length=4)
    expiry_month: Optional[int] = Field(None, ge=1, le=12)
    expiry_year: Optional[int] = Field(None, ge=2024, le=2040)
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
    session_id: str = Field(..., min_length=24, max_length=24)
    amount: float = Field(..., gt=0, le=1000000)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    payment_method: PaymentMethod
    card_number: Optional[str] = Field(None, min_length=13, max_length=19)
    cvv: Optional[str] = Field(None, min_length=3, max_length=4)
    cardholder_name: Optional[str] = Field(None, min_length=2, max_length=100)

    @validator('card_number')
    def validate_card_number(cls, v):
        if v and not v.isdigit():
            raise ValueError('Card number must contain only digits')
        return v

    @validator('cvv')
    def validate_cvv(cls, v):
        if v and not v.isdigit():
            raise ValueError('CVV must contain only digits')
        return v

    @validator('currency')
    def validate_currency(cls, v):
        allowed_currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
        if v.upper() not in allowed_currencies:
            raise ValueError(f'Currency must be one of: {allowed_currencies}')
        return v.upper()

    @validator('session_id')
    def validate_session_id(cls, v):
        try:
            ObjectId(v)
        except:
            raise ValueError('Invalid session ID format')
        return v

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
    payment_method: dict
    status: str
    transaction_id: Optional[str] = None
    failure_reason: Optional[str] = None
    processed_at: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    @field_serializer('processed_at', 'created_at', 'updated_at')
    def serialize_datetime(self, dt: Union[datetime, str, None], _info) -> Optional[str]:
        if dt is None:
            return None
        if isinstance(dt, datetime):
            return dt.isoformat()
        elif isinstance(dt, str):
            return dt
        return None

    class Config:
        from_attributes = True

class PaymentHistory(BaseModel):
    """Schema for payment history (admin view)."""
    payments: List[Dict[str, Any]]  # Use basic dict instead of PaymentResponse
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

    @field_serializer('created_at')
    def serialize_datetime(self, dt: Union[datetime, str, None], _info) -> Optional[str]:
        if dt is None:
            return None
        if isinstance(dt, datetime):
            return dt.isoformat()
        elif isinstance(dt, str):
            return dt
        return None

class RefundRequest(BaseModel):
    """Schema for refund requests."""
    payment_id: Optional[str] = None
    reason: str
    amount: Optional[float] = None

class RefundResponse(BaseModel):
    """Schema for refund response."""
    id: str
    payment_id: str
    amount: float
    reason: str
    status: Literal["pending", "approved", "rejected", "processed"]
    created_at: str
    processed_at: Optional[str] = None

# Generate or get encryption key (your existing code)
def get_encryption_key():
    """Get or generate a proper Fernet encryption key."""
    key_from_env = os.getenv("PAYMENT_ENCRYPTION_KEY")
    
    if key_from_env:
        try:
            return Fernet(key_from_env.encode() if isinstance(key_from_env, str) else key_from_env)
        except ValueError:
            print("Invalid encryption key in environment, generating new one...")
    
    key = Fernet.generate_key()
    print(f"Generated new encryption key: {key.decode()}")
    print("Add this to your environment variables: PAYMENT_ENCRYPTION_KEY=" + key.decode())
    return Fernet(key)

cipher_suite = get_encryption_key()

def encrypt_sensitive_data(data: str) -> str:
    """Encrypt sensitive payment data."""
    if not data:
        return None
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Decrypt sensitive payment data."""
    if not encrypted_data:
        return None
    try:
        return cipher_suite.decrypt(encrypted_data.encode()).decode()
    except:
        return None

def generate_transaction_id() -> str:
    """Generate a unique transaction ID."""
    return 'TXN_' + ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(12))

def mask_card_number(card_number: str) -> str:
    """Mask card number showing only last 4 digits."""
    if not card_number or len(card_number) < 4:
        return "****"
    return "*" * (len(card_number) - 4) + card_number[-4:]

async def get_all_payments(
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
) -> List[dict]:
    """Get all payments with optional filters."""
    query = {}
    
    if user_id:
        query["user_id"] = user_id
    if status:
        query["status"] = status
    
    payments = []
    async for payment in payments_collection.find(query).skip(skip).limit(limit).sort("created_at", -1):
        payment["id"] = str(payment["_id"])
        del payment["_id"]
        
        # Remove sensitive encrypted data from response
        payment.pop("encrypted_card_number", None)
        payment.pop("encrypted_cvv", None)
        payment.pop("encrypted_cardholder_name", None)
        
        payments.append(payment)
    
    # Convert all datetime objects to strings
    return prepare_response_data(payments)

async def get_payment_by_id(payment_id: str) -> Optional[dict]:
    """Get a payment by ID."""
    try:
        payment = await payments_collection.find_one({"_id": ObjectId(payment_id)})
        if payment:
            payment["id"] = str(payment["_id"])
            del payment["_id"]
            
            # Remove sensitive encrypted data from response
            payment.pop("encrypted_card_number", None)
            payment.pop("encrypted_cvv", None)
            payment.pop("encrypted_cardholder_name", None)
            
            # Convert datetime objects to strings
            return prepare_response_data(payment)
        return None
    except:
        return None

async def get_user_payments(user_id: str, limit: int = 50) -> List[dict]:
    """Get all payments for a specific user."""
    return await get_all_payments(user_id=user_id, limit=limit)

async def get_payment_history(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    user_id: Optional[str] = None,
    status: Optional[str] = None
) -> PaymentHistory:
    """Get payment history with analytics."""
    try:
        query = {}
        
        if start_date or end_date:
            date_query = {}
            if start_date:
                date_query["$gte"] = start_date
            if end_date:
                date_query["$lte"] = end_date
            query["created_at"] = date_query
            
        if user_id:
            query["user_id"] = user_id
        if status:
            query["status"] = status
        
        # Get payments
        payments = []
        async for payment in payments_collection.find(query).sort("created_at", -1):
            payment["id"] = str(payment["_id"])
            del payment["_id"]
            
            # Remove sensitive data
            payment.pop("encrypted_card_number", None)
            payment.pop("encrypted_cvv", None)
            payment.pop("encrypted_cardholder_name", None)
            
            payments.append(payment)
        
        # Convert datetime objects to strings
        payments = prepare_response_data(payments)
        
        # Calculate analytics
        total_payments = len(payments)
        total_amount = sum(p.get("amount", 0) for p in payments)
        successful_payments = len([p for p in payments if p.get("status") == "completed"])
        failed_payments = len([p for p in payments if p.get("status") == "failed"])
        pending_payments = len([p for p in payments if p.get("status") == "pending"])
        
        return PaymentHistory(
            payments=payments,
            total_payments=total_payments,
            total_amount=total_amount,
            successful_payments=successful_payments,
            failed_payments=failed_payments,
            pending_payments=pending_payments
        )
    except Exception as e:
        print(f"Error getting payment history: {e}")
        return PaymentHistory(
            payments=[],
            total_payments=0,
            total_amount=0,
            successful_payments=0,
            failed_payments=0,
            pending_payments=0
        )

async def create_payment(payment: PaymentCreate, user_id: str) -> dict:
    """Create a new payment record with encrypted sensitive data."""
    try:
        current_time = datetime.utcnow()
        
        # Verify session exists and belongs to user
        try:
            session = await charging_sessions_collection.find_one({"_id": ObjectId(payment.session_id)})
        except Exception as e:
            raise ValueError(f"Invalid session ID format: {payment.session_id}")
        
        if not session:
            raise ValueError(f"Charging session {payment.session_id} not found")
        
        if session["user_id"] != user_id:
            raise ValueError("Session does not belong to the current user")
        
        # Check if payment already exists for this session
        existing_payment = await payments_collection.find_one({"session_id": payment.session_id})
        if existing_payment:
            raise ValueError("Payment already exists for this session")
        
        # Encrypt sensitive data
        encrypted_card_number = encrypt_sensitive_data(payment.card_number) if payment.card_number else None
        encrypted_cvv = encrypt_sensitive_data(payment.cvv) if payment.cvv else None
        encrypted_cardholder_name = encrypt_sensitive_data(payment.cardholder_name) if payment.cardholder_name else None
        
        # Prepare payment method with masked card number
        payment_method_data = payment.payment_method.model_dump()
        if payment.card_number:
            payment_method_data["last_four_digits"] = payment.card_number[-4:] if len(payment.card_number) >= 4 else "****"
        
        new_payment = {
            "session_id": payment.session_id,
            "user_id": user_id,
            "amount": payment.amount,
            "currency": payment.currency,
            "payment_method": payment_method_data,
            "status": "pending",
            "transaction_id": generate_transaction_id(),
            "encrypted_card_number": encrypted_card_number,
            "encrypted_cvv": encrypted_cvv,
            "encrypted_cardholder_name": encrypted_cardholder_name,
            "created_at": current_time,
            "updated_at": current_time
        }
        
        result = await payments_collection.insert_one(new_payment)
        
        # Update session payment status
        await charging_sessions_collection.update_one(
            {"_id": ObjectId(payment.session_id)},
            {"$set": {"payment_status": "pending", "updated_at": current_time}}
        )
        
        return {
            "id": str(result.inserted_id),
            "transaction_id": new_payment["transaction_id"],
            "status": "pending",
            "amount": payment.amount,
            "currency": payment.currency
        }
        
    except ValueError as e:
        raise e
    except Exception as e:
        raise ValueError(f"Failed to create payment: {str(e)}")

async def update_payment_status(
    payment_id: str, 
    status: str, 
    transaction_id: Optional[str] = None,
    failure_reason: Optional[str] = None
) -> bool:
    """Update payment status (for payment gateway callbacks)."""
    try:
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        
        if transaction_id:
            update_data["transaction_id"] = transaction_id
            
        if failure_reason:
            update_data["failure_reason"] = failure_reason
            
        if status == "completed":
            update_data["processed_at"] = datetime.utcnow()
        
        result = await payments_collection.update_one(
            {"_id": ObjectId(payment_id)},
            {"$set": update_data}
        )
        
        # Update session payment status
        if result.modified_count > 0:
            payment = await payments_collection.find_one({"_id": ObjectId(payment_id)})
            if payment:
                session_payment_status = "paid" if status == "completed" else status
                await charging_sessions_collection.update_one(
                    {"_id": ObjectId(payment["session_id"])},
                    {"$set": {"payment_status": session_payment_status, "updated_at": datetime.utcnow()}}
                )
        
        return result.modified_count > 0
    except:
        return False

async def process_refund(refund_request: RefundRequest) -> dict:
    """Process a refund request."""
    try:
        # Get the original payment
        payment = await payments_collection.find_one({"_id": ObjectId(refund_request.payment_id)})
        if not payment:
            raise ValueError("Payment not found")
        
        if payment["status"] != "completed":
            raise ValueError("Can only refund completed payments")
        
        # Check if already refunded
        existing_refund = await refunds_collection.find_one({"payment_id": refund_request.payment_id})
        if existing_refund:
            raise ValueError("Payment already has a refund request")
        
        current_time = datetime.utcnow()
        refund_amount = refund_request.amount if refund_request.amount else payment["amount"]
        
        new_refund = {
            "payment_id": refund_request.payment_id,
            "original_amount": payment["amount"],
            "refund_amount": refund_amount,
            "reason": refund_request.reason,
            "status": "pending",
            "created_at": current_time,
            "updated_at": current_time
        }
        
        result = await refunds_collection.insert_one(new_refund)
        
        # Update payment status
        await payments_collection.update_one(
            {"_id": ObjectId(refund_request.payment_id)},
            {"$set": {"status": "refunded", "updated_at": current_time}}
        )
        
        return {
            "refund_id": str(result.inserted_id),
            "status": "pending",
            "amount": refund_amount
        }
        
    except ValueError as e:
        raise e
    except Exception as e:
        raise ValueError(f"Failed to process refund: {str(e)}")

async def get_user_payment_summary(user_id: str) -> UserPaymentSummary:
    """Get payment summary for a user."""
    try:
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": None,
                "total_payments": {"$sum": 1},
                "total_amount": {"$sum": "$amount"},
                "successful_payments": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}},
                "failed_payments": {"$sum": {"$cond": [{"$eq": ["$status", "failed"]}, 1, 0]}},
                "pending_payments": {"$sum": {"$cond": [{"$eq": ["$status", "pending"]}, 1, 0]}}
            }}
        ]
        
        result = await payments_collection.aggregate(pipeline).to_list(1)
        
        if result:
            stats = result[0]
            return UserPaymentSummary(
                user_id=user_id,
                total_payments=stats.get("total_payments", 0),
                total_amount=stats.get("total_amount", 0),
                successful_payments=stats.get("successful_payments", 0),
                failed_payments=stats.get("failed_payments", 0),
                pending_payments=stats.get("pending_payments", 0)
            )
        else:
            return UserPaymentSummary(
                user_id=user_id,
                total_payments=0,
                total_amount=0,
                successful_payments=0,
                failed_payments=0,
                pending_payments=0
            )
    except:
        return UserPaymentSummary(
            user_id=user_id,
            total_payments=0,
            total_amount=0,
            successful_payments=0,
            failed_payments=0,
            pending_payments=0
        )