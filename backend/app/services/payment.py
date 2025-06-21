from app.database import payments_collection, charging_sessions_collection, refunds_collection
from app.schemas.payment import (
    PaymentCreate, 
    PaymentUpdate, 
    PaymentHistory,
    UserPaymentSummary,
    RefundRequest
)
from bson import ObjectId
from datetime import datetime
from typing import List, Optional, Dict, Any
from cryptography.fernet import Fernet
import os
import json
import secrets
import string

# Encryption key (should be stored securely in environment variables)
ENCRYPTION_KEY = os.getenv("PAYMENT_ENCRYPTION_KEY", Fernet.generate_key())
cipher_suite = Fernet(ENCRYPTION_KEY) if isinstance(ENCRYPTION_KEY, bytes) else Fernet(ENCRYPTION_KEY.encode())

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

async def create_payment(payment: PaymentCreate, user_id: str) -> dict:
    """Create a new payment record with encrypted sensitive data."""
    current_time = datetime.utcnow()
    
    # Verify session exists and belongs to user
    session = await charging_sessions_collection.find_one({"_id": ObjectId(payment.session_id)})
    if not session:
        raise ValueError("Charging session not found")
    
    if session["user_id"] != user_id:
        raise ValueError("Session does not belong to the user")
    
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
        "amount": payment.amount
    }

async def get_payment_by_id(payment_id: str, decrypt_data: bool = False) -> Optional[dict]:
    """Get payment by ID with optional decryption (admin only)."""
    try:
        payment = await payments_collection.find_one({"_id": ObjectId(payment_id)})
        if payment:
            payment["id"] = str(payment["_id"])
            del payment["_id"]
            
            # Decrypt sensitive data if requested (admin only)
            if decrypt_data:
                if payment.get("encrypted_card_number"):
                    payment["decrypted_card_number"] = decrypt_sensitive_data(payment["encrypted_card_number"])
                if payment.get("encrypted_cvv"):
                    payment["decrypted_cvv"] = decrypt_sensitive_data(payment["encrypted_cvv"])
                if payment.get("encrypted_cardholder_name"):
                    payment["decrypted_cardholder_name"] = decrypt_sensitive_data(payment["encrypted_cardholder_name"])
        
        return payment
    except:
        return None

async def get_all_payments(
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    skip: int = 0,
    admin_view: bool = False
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
        
        # Remove encrypted fields from response unless admin view
        if not admin_view:
            payment.pop("encrypted_card_number", None)
            payment.pop("encrypted_cvv", None)
            payment.pop("encrypted_cardholder_name", None)
            payment.pop("gateway_response", None)
        
        payments.append(payment)
    
    return payments

async def update_payment(payment_id: str, payment_update: PaymentUpdate) -> bool:
    """Update payment status and details."""
    try:
        update_data = {}
        
        for field, value in payment_update.model_dump(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            result = await payments_collection.update_one(
                {"_id": ObjectId(payment_id)},
                {"$set": update_data}
            )
            
            # Update session payment status
            if "status" in update_data:
                payment = await get_payment_by_id(payment_id)
                if payment:
                    await charging_sessions_collection.update_one(
                        {"_id": ObjectId(payment["session_id"])},
                        {"$set": {"payment_status": update_data["status"]}}
                    )
            
            return result.modified_count > 0
        return False
    except:
        return False

async def process_payment(payment_id: str) -> bool:
    """Process a payment (simulate payment gateway)."""
    try:
        payment = await get_payment_by_id(payment_id, decrypt_data=True)
        if not payment or payment["status"] != "pending":
            return False
        
        # Simulate payment processing
        import random
        success = random.choice([True, True, True, False])  # 75% success rate for demo
        
        current_time = datetime.utcnow()
        
        if success:
            update_data = {
                "status": "completed",
                "processed_at": current_time,
                "gateway_response": {
                    "gateway": "demo_gateway",
                    "response_code": "00",
                    "response_message": "Transaction successful"
                },
                "updated_at": current_time
            }
        else:
            update_data = {
                "status": "failed",
                "processed_at": current_time,
                "failure_reason": "Insufficient funds",
                "gateway_response": {
                    "gateway": "demo_gateway",
                    "response_code": "51",
                    "response_message": "Insufficient funds"
                },
                "updated_at": current_time
            }
        
        result = await payments_collection.update_one(
            {"_id": ObjectId(payment_id)},
            {"$set": update_data}
        )
        
        # Update session payment status
        await charging_sessions_collection.update_one(
            {"_id": ObjectId(payment["session_id"])},
            {"$set": {"payment_status": update_data["status"]}}
        )
        
        return result.modified_count > 0
    except:
        return False

async def get_payment_history(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    user_id: Optional[str] = None
) -> PaymentHistory:
    """Get payment history with analytics (admin only)."""
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
        
        # Get all payments
        payments = await get_all_payments(
            user_id=user_id, 
            limit=1000, 
            admin_view=True
        )
        
        # Calculate analytics
        total_payments = len(payments)
        total_amount = sum(p["amount"] for p in payments)
        successful_payments = len([p for p in payments if p["status"] == "completed"])
        failed_payments = len([p for p in payments if p["status"] == "failed"])
        pending_payments = len([p for p in payments if p["status"] == "pending"])
        
        return PaymentHistory(
            payments=payments,
            total_payments=total_payments,
            total_amount=total_amount,
            successful_payments=successful_payments,
            failed_payments=failed_payments,
            pending_payments=pending_payments
        )
    except:
        return PaymentHistory(
            payments=[],
            total_payments=0,
            total_amount=0,
            successful_payments=0,
            failed_payments=0,
            pending_payments=0
        )

async def get_user_payment_summary(user_id: str, limit: int = 50) -> List[UserPaymentSummary]:
    """Get user's payment summary (limited view without sensitive data)."""
    try:
        payments = await get_all_payments(user_id=user_id, limit=limit, admin_view=False)
        
        summary = []
        for payment in payments:
            summary.append(UserPaymentSummary(
                id=payment["id"],
                session_id=payment["session_id"],
                amount=payment["amount"],
                currency=payment["currency"],
                status=payment["status"],
                created_at=payment.get("created_at")
            ))
        
        return summary
    except:
        return []

async def create_refund(refund_request: RefundRequest, admin_user_id: str) -> dict:
    """Create a refund request (admin only)."""
    try:
        payment = await get_payment_by_id(refund_request.payment_id)
        if not payment or payment["status"] != "completed":
            raise ValueError("Payment not found or not eligible for refund")
        
        refund_amount = refund_request.amount or payment["amount"]
        if refund_amount > payment["amount"]:
            raise ValueError("Refund amount cannot exceed payment amount")
        
        current_time = datetime.utcnow()
        
        new_refund = {
            "payment_id": refund_request.payment_id,
            "amount": refund_amount,
            "reason": refund_request.reason,
            "status": "pending",
            "requested_by": admin_user_id,
            "created_at": current_time,
            "updated_at": current_time
        }
        
        result = await refunds_collection.insert_one(new_refund)
        
        return {
            "id": str(result.inserted_id),
            "status": "pending",
            "amount": refund_amount
        }
    except Exception as e:
        raise ValueError(str(e))

async def process_refund(refund_id: str) -> bool:
    """Process a refund (admin only)."""
    try:
        refund = await refunds_collection.find_one({"_id": ObjectId(refund_id)})
        if not refund or refund["status"] != "pending":
            return False
        
        current_time = datetime.utcnow()
        
        # Update refund status
        await refunds_collection.update_one(
            {"_id": ObjectId(refund_id)},
            {"$set": {
                "status": "processed",
                "processed_at": current_time,
                "updated_at": current_time
            }}
        )
        
        # Update payment status
        await payments_collection.update_one(
            {"_id": ObjectId(refund["payment_id"])},
            {"$set": {
                "status": "refunded",
                "updated_at": current_time
            }}
        )
        
        return True
    except:
        return False