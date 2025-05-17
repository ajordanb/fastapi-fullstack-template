from pathlib import Path
from jinja2 import Template
from typing import Any
import emails
from loguru import logger

from app.config import settings
from app.shared.model import EmailData


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
            Path(__file__).parent / "email-templates" / "built" / template_name
    ).read_text()
    html_content = Template(template_str).render(context)
    return html_content


def send_email(email: EmailData) -> None:
    assert settings.emails_enabled, "🛑 No provided configuration for email variables 🛑"
    message = emails.Message(
        subject=email.subject,
        html=email.html_content,
        mail_from=(settings.emails_from_name, settings.emails_from_email),
    )
    for attachment in email.attachments or []:
        message.attach(filename=attachment.file_name, data=attachment.file_data)
    smtp_options = {"host": settings.smtp_host, "port": settings.smtp_port}
    if settings.smtp_tls:
        smtp_options["tls"] = True
    elif settings.smtp_ssl:
        smtp_options["ssl"] = True
    if settings.smtp_user:
        smtp_options["user"] = settings.smtp_user
    if settings.smtp_password:
        smtp_options["password"] = settings.smtp_password
    response = message.send(to=email.to, smtp=smtp_options)
    logger.info(f"send email result: {response}")


def generate_reset_password_email(reset_email: str, token: str) -> EmailData:
    subject = f"Password recovery for user {reset_email}"
    link = f"{settings.app_domain}/password_reset?code={token}"
    html_content = render_email_template(
        template_name="reset_password.html",
        context={
            "reset_email": reset_email,
            "valid_minutes": settings.email_reset_token_expire_minutes,
            "reset_link": link,
        },
    )
    return EmailData(to=reset_email, html_content=html_content, subject=subject)


def generate_magic_link_email(user_email: str, token: str) -> EmailData:
    subject = f"Magic link for user {user_email}"
    link = f"{settings.app_domain}/magic_link?code={token}"
    html_content = render_email_template(
        template_name="magic_link.html",
        context={
            "user_email": user_email,
            "valid_minutes": settings.email_reset_token_expire_minutes,
            "magic_link": link,
        }
    )
    return EmailData(to=user_email, html_content=html_content, subject=subject)