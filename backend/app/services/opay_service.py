"""
OPay Payment Service — Express Checkout (Cashier redirect flow).

Handles:
  1. Creating a cashier payment (redirect URL for user)
  2. Verifying callback signatures from OPay webhooks
  3. Querying payment status

OPay Docs: https://doc.opaycheckout.com/cashier-create
"""
import hashlib
import hmac
import json
import logging
import uuid
from datetime import datetime, timezone

import httpx

from app.core.config import get_settings

logger = logging.getLogger("joyshiddenbeauty.opay")
settings = get_settings()


def generate_reference(prefix: str = "JHB") -> str:
    """Generate a unique payment reference. Format: JHB-<timestamp>-<short_uuid>."""
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    short_id = uuid.uuid4().hex[:8].upper()
    return f"{prefix}-{ts}-{short_id}"


def create_cashier_payment(
    reference: str,
    amount_naira: float,
    user_email: str,
    user_name: str,
    user_id: str,
    product_name: str,
    product_description: str,
    return_url: str,
    callback_url: str,
    cancel_url: str,
    expire_at: int = 600,
) -> dict:
    """
    Call OPay Cashier Create Payment API.

    Returns the full OPay response dict including:
      - data.cashierUrl (redirect the user here)
      - data.orderNo
      - data.reference
      - data.status

    Raises httpx.HTTPStatusError on non-2xx responses.
    """
    url = f"{settings.OPAY_BASE_URL}/api/v1/international/cashier/create"
    # OPay expects amount in the smallest currency unit (kobo for NGN)
    amount_kobo = int(round(amount_naira * 100))

    payload = {
        "country": "NG",
        "reference": reference,
        "amount": {
            "total": amount_kobo,
            "currency": "NGN",
        },
        "returnUrl": return_url,
        "callbackUrl": callback_url,
        "cancelUrl": cancel_url,
        "expireAt": expire_at,
        "userInfo": {
            "userEmail": user_email,
            "userId": str(user_id),
            "userName": user_name,
        },
        "productList": [
            {
                "productId": reference,
                "name": product_name,
                "description": product_description,
                "price": amount_kobo,
                "quantity": 1,
            }
        ],
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.OPAY_PUBLIC_KEY}",
        "MerchantId": settings.OPAY_MERCHANT_ID,
    }

    logger.info(f"OPay Cashier Create → reference={reference}, amount=₦{amount_naira}")

    with httpx.Client(timeout=30) as client:
        response = client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

    if data.get("code") != "00000":
        logger.error(f"OPay Cashier Create failed: {data}")
        raise ValueError(f"OPay error: {data.get('message', 'Unknown error')}")

    logger.info(f"OPay Cashier Create OK → orderNo={data['data'].get('orderNo')}")
    return data


def query_payment_status(reference: str) -> dict:
    """
    Query OPay for the status of a payment by its reference.
    Returns the OPay response dict.
    """
    url = f"{settings.OPAY_BASE_URL}/api/v1/international/cashier/status"

    payload = {
        "country": "NG",
        "reference": reference,
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.OPAY_PUBLIC_KEY}",
        "MerchantId": settings.OPAY_MERCHANT_ID,
    }

    with httpx.Client(timeout=30) as client:
        response = client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

    logger.info(f"OPay Status Query → reference={reference}, status={data.get('data', {}).get('status')}")
    return data


def verify_callback_signature(payload_dict: dict, received_sha512: str) -> bool:
    """
    Verify the SHA512 HMAC signature on an OPay callback.

    OPay signs the 'payload' object with your Secret Key using HMAC-SHA512.
    We recompute the signature and compare.
    """
    if not settings.OPAY_SECRET_KEY:
        logger.warning("OPAY_SECRET_KEY not set — skipping signature verification (dev mode)")
        return True

    # OPay signs the JSON-serialized payload (sorted keys, no spaces)
    payload_str = json.dumps(payload_dict, sort_keys=True, separators=(",", ":"))
    computed = hmac.new(
        settings.OPAY_SECRET_KEY.encode("utf-8"),
        payload_str.encode("utf-8"),
        hashlib.sha512,
    ).hexdigest()

    is_valid = hmac.compare_digest(computed, received_sha512)
    if not is_valid:
        logger.warning(f"OPay callback signature mismatch. Expected={computed[:16]}..., Got={received_sha512[:16]}...")
    return is_valid
