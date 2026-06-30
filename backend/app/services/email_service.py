import smtplib
from email.message import EmailMessage
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        settings = get_settings()
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_EMAIL
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.FROM_EMAIL

    def _send_email(self, to_email: str, subject: str, html_content: str):
        if not self.user or not self.password:
            logger.warning("SMTP credentials not set. Simulating email send.")
            logger.info(f"Simulated email to {to_email}: {subject}")
            return

        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = self.from_email
        msg['To'] = to_email
        msg.add_alternative(html_content, subtype='html')

        try:
            with smtplib.SMTP(self.host, self.port) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.send_message(msg)
            logger.info(f"Successfully sent email to {to_email}")
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            raise e

    def send_waitlist_welcome_email(self, to_email: str, name: str):
        subject = "Welcome to the Inner Circle - Joy's Hidden Beauty"
        first_name = name.split()[0] if name else "there"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0A0A; color: #E5E5E5; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 40px auto; background-color: #121212; border: 1px solid #333333; border-top: 4px solid #D4AF37; padding: 40px; text-align: center; }}
                .logo {{ font-family: 'Times New Roman', Times, serif; font-size: 24px; letter-spacing: 4px; color: #D4AF37; margin-bottom: 30px; text-transform: uppercase; }}
                h1 {{ font-size: 22px; font-weight: 300; letter-spacing: 2px; margin-bottom: 20px; color: #FFFFFF; }}
                p {{ font-size: 15px; line-height: 1.6; color: #A1A1AA; margin-bottom: 20px; }}
                .footer {{ font-size: 12px; color: #555555; margin-top: 40px; border-top: 1px solid #222222; padding-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">Joy's Hidden Beauty</div>
                <h1>WELCOME TO THE CIRCLE</h1>
                <p>Dear {first_name},</p>
                <p>Thank you for joining the exclusive waitlist for Joy's Hidden Beauty. You are now officially part of our inner circle.</p>
                <p>We are meticulously crafting our debut line of quality essentials and bespoke beauty services. As a waitlist member, you will be the absolute first to know when we open our doors and you will receive priority access to our offerings.</p>
                <p>Stay tuned for early access and behind-the-scenes insights directly to your inbox.</p>
                <div class="footer">
                    &copy; 2026 Joy's Hidden Beauty. All rights reserved.<br>
                    Experience Quality, Redefined.
                </div>
            </div>
        </body>
        </html>
        """
        self._send_email(to_email, subject, html_content)

    def send_waitlist_contact_email(self, to_email: str, name: str):
        subject = "Your Time Has Arrived - Joy's Hidden Beauty"
        first_name = name.split()[0] if name else "there"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0A0A; color: #E5E5E5; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 40px auto; background-color: #121212; border: 1px solid #333333; border-top: 4px solid #D4AF37; padding: 40px; text-align: center; }}
                .logo {{ font-family: 'Times New Roman', Times, serif; font-size: 24px; letter-spacing: 4px; color: #D4AF37; margin-bottom: 30px; text-transform: uppercase; }}
                h1 {{ font-size: 22px; font-weight: 300; letter-spacing: 2px; margin-bottom: 20px; color: #FFFFFF; }}
                p {{ font-size: 15px; line-height: 1.6; color: #A1A1AA; margin-bottom: 20px; }}
                .btn {{ display: inline-block; padding: 14px 35px; background-color: #D4AF37; color: #000000; text-decoration: none; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-top: 20px; margin-bottom: 30px; font-weight: bold; }}
                .footer {{ font-size: 12px; color: #555555; margin-top: 40px; border-top: 1px solid #222222; padding-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">Joy's Hidden Beauty</div>
                <h1>YOUR TIME HAS ARRIVED</h1>
                <p>Dear {first_name},</p>
                <p>The wait is finally over. We are thrilled to invite you to experience Joy's Hidden Beauty firsthand.</p>
                <p>As one of our esteemed waitlist members, you now have exclusive priority access to book your initial bespoke beauty session and secure your place.</p>
                <a href="{get_settings().FRONTEND_URL}/booking" class="btn">Enter the Portal</a>
                <p>If you require direct assistance in styling your experience, simply reply to this email.</p>
                <div class="footer">
                    &copy; 2026 Joy's Hidden Beauty. All rights reserved.<br>
                    Experience Quality, Redefined.
                </div>
            </div>
        </body>
        </html>
        """
        self._send_email(to_email, subject, html_content)

    def send_inquiry_receipt_email(self, to_email: str, name: str):
        subject = "We have received your inquiry - Joy's Hidden Beauty"
        first_name = name.split()[0] if name else "there"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0A0A; color: #E5E5E5; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 40px auto; background-color: #121212; border: 1px solid #333333; border-top: 4px solid #D4AF37; padding: 40px; text-align: center; }}
                .logo {{ font-family: 'Times New Roman', Times, serif; font-size: 24px; letter-spacing: 4px; color: #D4AF37; margin-bottom: 30px; text-transform: uppercase; }}
                h1 {{ font-size: 22px; font-weight: 300; letter-spacing: 2px; margin-bottom: 20px; color: #FFFFFF; }}
                p {{ font-size: 15px; line-height: 1.6; color: #A1A1AA; margin-bottom: 20px; }}
                .footer {{ font-size: 12px; color: #555555; margin-top: 40px; border-top: 1px solid #222222; padding-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">Joy's Hidden Beauty</div>
                <h1>CONCIERGE INQUIRY RECEIVED</h1>
                <p>Dear {first_name},</p>
                <p>Thank you for reaching out to Joy's Hidden Beauty. This email confirms that our Concierge team has successfully received your message.</p>
                <p>We review every inquiry meticulously and will respond to you as soon as possible. Your patience and interest in our bespoke services are greatly appreciated.</p>
                <div class="footer">
                    &copy; 2026 Joy's Hidden Beauty. All rights reserved.<br>
                    Experience Quality, Redefined.
                </div>
            </div>
        </body>
        </html>
        """
        self._send_email(to_email, subject, html_content)

    def send_admin_inquiry_alert(self, inquiry_type: str, user_email: str, message: str):
        subject = f"NEW INQUIRY: {inquiry_type} from {user_email}"
        html_content = f"""
        <html>
        <body style='font-family: Arial, sans-serif; color: #1C1C1C;'>
            <h2>New Concierge Inquiry Received</h2>
            <p><strong>From:</strong> {user_email}</p>
            <p><strong>Type:</strong> {inquiry_type}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left: 3px solid #D4AF37; padding-left: 10px; color: #555;">{message}</blockquote>
            <p><a href="{get_settings().FRONTEND_URL}/admin">Log in to Admin Dashboard to respond</a></p>
        </body>
        </html>
        """
        self._send_email(self.from_email, subject, html_content)

    def send_vip_retention_email(self, to_email: str, first_name: str):
        subject = "We miss you at Joy's Hidden Beauty"
        html_content = f"""
        <html>
        <body style='font-family: Arial, sans-serif; color: #1C1C1C; max-width: 600px; margin: 0 auto; background-color: #FAFAFA; text-align: center; padding: 40px;'>
            <h1 style='color: #D4AF37; letter-spacing: 2px; text-transform: uppercase;'>Joy's Hidden Beauty</h1>
            <p>Dear {first_name},</p>
            <p>It has been a while since we last had the pleasure of serving you. We wanted to personally reach out and let you know that you are deeply missed.</p>
            <p>As a token of our appreciation for your past patronage, we would like to offer you an exclusive VIP reward to welcome you back.</p>
            <p>Use the code <strong>VIPCOMEBACK15</strong> for an exclusive 15% courtesy on your next bespoke booking or beauty purchase.</p>
            <div style='margin-top: 30px; margin-bottom: 30px;'>
                <a href='{get_settings().FRONTEND_URL}/shop' style='padding: 15px 30px; background-color: #121212; color: #D4AF37; text-decoration: none; font-weight: bold; letter-spacing: 2px;'>Explore The New Collection</a>
            </div>
            <p style='font-size: 12px; color: #777;'>&copy; 2026 Joy's Hidden Beauty.</p>
        </body>
        </html>
        """
        self._send_email(to_email, subject, html_content)

email_service = EmailService()


def send_email(to: str, template_name: str, **kwargs):
    """Legacy email helper for auth endpoints."""
    first_name = kwargs.get("first_name", "there")
    subject = f"Welcome to Joy's Hidden Beauty, {first_name}!"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0A0A; color: #E5E5E5; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 40px auto; background-color: #121212; border: 1px solid #333333; border-top: 4px solid #D4AF37; padding: 40px; text-align: center; }}
            .logo {{ font-family: 'Times New Roman', Times, serif; font-size: 24px; letter-spacing: 4px; color: #D4AF37; margin-bottom: 30px; text-transform: uppercase; }}
            h1 {{ font-size: 22px; font-weight: 300; letter-spacing: 2px; margin-bottom: 20px; color: #FFFFFF; }}
            p {{ font-size: 15px; line-height: 1.6; color: #A1A1AA; margin-bottom: 20px; }}
            .btn {{ display: inline-block; padding: 14px 35px; background-color: #D4AF37; color: #000000; text-decoration: none; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-top: 20px; margin-bottom: 30px; font-weight: bold; }}
            .footer {{ font-size: 12px; color: #555555; margin-top: 40px; border-top: 1px solid #222222; padding-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">Joy's Hidden Beauty</div>
            <h1>WELCOME TO THE FAMILY</h1>
            <p>Dear {first_name},</p>
            <p>Thank you for creating an account with Joy's Hidden Beauty. We are absolutely thrilled to welcome you to our community.</p>
            <p>As a member, you now have exclusive access to our premium skincare collections, bespoke beauty services, and personalized recommendations.</p>
            <a href="{get_settings().FRONTEND_URL}/account" class="btn">Explore Your Account</a>
            <div class="footer">
                &copy; 2026 Joy's Hidden Beauty. All rights reserved.<br>
                Experience Quality, Redefined.
            </div>
        </div>
    </body>
    </html>
    """
    email_service._send_email(to_email=to, subject=subject, html_content=html_content)
