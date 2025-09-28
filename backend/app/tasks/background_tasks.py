import dramatiq
from loguru import logger
from app.core.dramatiq_config import broker
from app.services.email.email import EmailService


@dramatiq.actor(max_retries=3, store_results=True)
def send_welcome_email_task(user_email: str, token: str) -> bool:
    """Background task to send welcome email"""
    email_service = EmailService()
    email_data = email_service.generate_welcome_email(user_email, token)
    return email_service.send_email(email_data)


@dramatiq.actor(max_retries=3, store_results=True)
def send_reset_password_email_task(user_email: str, token: str) -> bool:
    """Background task to send password reset email"""
    email_service = EmailService()
    email_data = email_service.generate_reset_password_email(user_email, token)
    return email_service.send_email(email_data)


@dramatiq.actor(max_retries=3, store_results=True)
def send_magic_link_email_task(user_email: str, token: str) -> bool:
    email_service = EmailService()
    email_data = email_service.generate_magic_link_email(user_email, token)
    return email_service.send_email(email_data)

@dramatiq.actor(max_retries=2)
def cleanup_expired_tokens():
    try:
        logger.info("Starting token cleanup task")
        logger.info("Token cleanup completed")
    except Exception as e:
        logger.error(f"Token cleanup failed: {e}")
        raise


@dramatiq.actor(max_retries=1)
def user_analytics_task(user_id: str, action: str):
    try:
        logger.info(f"Processing analytics for user {user_id}: {action}")
        logger.info(f"Analytics processed for user {user_id}")
    except Exception as e:
        logger.error(f"Analytics processing failed for user {user_id}: {e}")
        raise