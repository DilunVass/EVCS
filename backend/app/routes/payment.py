from fastapi import APIRouter, HTTPException, Depends, status, Query, Request
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.schemas.payment import (
    PaymentCreate,
    PaymentUpdate,
    PaymentResponse,
    PaymentHistory,
    UserPaymentSummary,
    RefundRequest
)
from app.services import payment as payment_service
from app.security.dependencies import get_current_user, require_admin
from app.schemas.user import UserResponse
import os
import json

router = APIRouter()

@router.post("/payments", response_model=dict)
async def create_payment(
    payment: PaymentCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new payment for a charging session."""
    try:
        result = await payment_service.create_payment(payment, current_user.id)
        return {"message": "Payment created successfully", "data": result}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment: {str(e)}"
        )

@router.get("/payments", response_model=List[PaymentResponse], dependencies=[Depends(require_admin)])
async def get_all_payments(
    current_user: UserResponse = Depends(get_current_user),
    user_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=200),
    skip: int = Query(0, ge=0)
):
    """Get all payments (Admin only - includes encrypted data access)."""
    try:
        payments = await payment_service.get_all_payments(
            user_id=user_id,
            status=status,
            limit=limit,
            skip=skip,
            admin_view=True
        )
        return payments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch payments: {str(e)}"
        )

@router.get("/payments/my-payments", response_model=List[UserPaymentSummary])
async def get_my_payments(
    current_user: UserResponse = Depends(get_current_user),
    limit: int = Query(50, le=100)
):
    """Get current user's payment summary (limited view without sensitive data)."""
    try:
        payments = await payment_service.get_user_payment_summary(current_user.id, limit)
        return payments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user payments: {str(e)}"
        )

@router.get("/payments/{payment_id}", response_model=PaymentResponse, dependencies=[Depends(require_admin)])
async def get_payment(
    payment_id: str,
    current_user: UserResponse = Depends(get_current_user),
    decrypt: bool = Query(False, description="Decrypt sensitive data (admin only)")
):
    """Get payment by ID (Admin only - can decrypt sensitive data)."""
    payment = await payment_service.get_payment_by_id(payment_id, decrypt_data=decrypt)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment

@router.put("/payments/{payment_id}", dependencies=[Depends(require_admin)])
async def update_payment(
    payment_id: str,
    payment_update: PaymentUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update payment status (Admin only)."""
    # Check if payment exists
    existing_payment = await payment_service.get_payment_by_id(payment_id)
    if not existing_payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    success = await payment_service.update_payment(payment_id, payment_update)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update payment"
        )
    
    return {"message": "Payment updated successfully"}

@router.post("/payments/{payment_id}/process", dependencies=[Depends(require_admin)])
async def process_payment(
    payment_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Process a payment (Admin only - simulates payment gateway)."""
    # Check if payment exists
    existing_payment = await payment_service.get_payment_by_id(payment_id)
    if not existing_payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    if existing_payment["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment is not in pending status"
        )
    
    success = await payment_service.process_payment(payment_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to process payment"
        )
    
    return {"message": "Payment processed successfully"}

@router.get("/payments/history/analytics", response_model=PaymentHistory, dependencies=[Depends(require_admin)])
async def get_payment_history(
    current_user: UserResponse = Depends(get_current_user),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    user_id: Optional[str] = Query(None)
):
    """Get payment history with analytics (Admin only)."""
    try:
        history = await payment_service.get_payment_history(start_date, end_date, user_id)
        return history
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch payment history: {str(e)}"
        )

@router.post("/payments/refunds", dependencies=[Depends(require_admin)])
async def create_refund(
    refund_request: RefundRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a refund request (Admin only)."""
    try:
        result = await payment_service.create_refund(refund_request, current_user.id)
        return {"message": "Refund request created successfully", "data": result}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create refund: {str(e)}"
        )

@router.post("/payments/refunds/{refund_id}/process", dependencies=[Depends(require_admin)])
async def process_refund(
    refund_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Process a refund (Admin only)."""
    success = await payment_service.process_refund(refund_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to process refund"
        )
    
    return {"message": "Refund processed successfully"}

@router.get("/payments/users/{user_id}/summary", response_model=List[UserPaymentSummary], dependencies=[Depends(require_admin)])
async def get_user_payment_summary(
    user_id: str,
    current_user: UserResponse = Depends(get_current_user),
    limit: int = Query(50, le=100)
):
    """Get payment summary for a specific user (Admin only)."""
    try:
        payments = await payment_service.get_user_payment_summary(user_id, limit)
        return payments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user payment summary: {str(e)}"
        )

@router.get("/payments")
async def get_payments(
    user_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    skip: int = Query(0, ge=0),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get payments with optional filters."""
    try:
        # If not admin, can only see own payments
        if current_user.role != "admin":
            user_id = current_user.id
        
        payments = await payment_service.get_all_payments(
            user_id=user_id,
            status=status,
            limit=limit,
            skip=skip,
            admin_view=(current_user.role == "admin")
        )
        
        return {
            "success": True,
            "data": payments,
            "count": len(payments)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get payments: {str(e)}"
        )

@router.post("/payments/webhook/flutterwave")
async def flutterwave_webhook(request: Request):
    """Handle Flutterwave webhook notifications."""
    try:
        # Get raw body for signature verification
        body = await request.body()
        payload = json.loads(body.decode())
        
        # Get signature from headers
        signature = request.headers.get("flutterwave-signature")
        secret_hash = os.getenv("FLW_SECRET_HASH")
        
        # Verify signature
        if not payment_service.verify_flutterwave_signature(body.decode(), signature, secret_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid signature"
            )
        
        # Process webhook
        result = await payment_service.process_flutterwave_webhook(payload)
        
        if result["status"] == "error":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["message"]
            )
        
        return {"message": "Webhook processed successfully", "result": result}
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}"
        )

@router.post("/payments/{payment_id}/verify")
async def verify_payment_with_flutterwave(
    payment_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Manually verify payment status with Flutterwave."""
    try:
        # Get payment from database
        payment = await payment_service.get_payment_by_id(payment_id)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        # Check if user owns the payment or is admin
        if current_user.role != "admin" and payment["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # TODO: Implement Flutterwave verification API call
        # This would make an API call to Flutterwave to verify the transaction
        
        return {"message": "Payment verification initiated"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification failed: {str(e)}"
        )