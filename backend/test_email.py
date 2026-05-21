import logging
import sys

logging.basicConfig(level=logging.INFO, stream=sys.stdout)

from app.services.email_service import send_email
from app.core.config import get_settings

settings = get_settings()
print(f"Loaded Password: '{settings.SMTP_PASSWORD}'")

try:
    send_email("tets@example.com", "welcome", first_name="Dev")
    print("Done")
except Exception as e:
    print("Error:", e)
