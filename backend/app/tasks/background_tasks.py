import asyncio
import dramatiq
from datetime import datetime, timezone
from loguru import logger
from app.core.dramatiq_config import broker
from app.services.email.email import EmailService
from app.models.user.model import User
from app.models.magic_link.model import MagicLink


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
    """Sync task that runs async database operations"""
    async def _cleanup_async():
        try:
            logger.info("Starting token cleanup task")

            # Example: Clean up expired magic links
            cutoff_time = datetime.now(timezone.utc)
            expired_links = await MagicLink.find(
                MagicLink.expires_at < cutoff_time
            ).to_list()

            if expired_links:
                for link in expired_links:
                    await link.delete()
                logger.info(f"Cleaned up {len(expired_links)} expired magic links")

            logger.info("Token cleanup completed")
            return True
        except Exception as e:
            logger.error(f"Token cleanup failed: {e}")
            raise

    return asyncio.run(_cleanup_async())


@dramatiq.actor(max_retries=1)
def user_analytics_task(user_id: str, action: str):
    """Sync task that runs async database operations for analytics"""
    async def _analytics_async():
        try:
            logger.info(f"Processing analytics for user {user_id}: {action}")

            # Example: Update user's last activity and analytics
            user = await User.by_id(user_id)
            if user:
                # Update last activity timestamp
                await user.update({
                    "last_activity": datetime.now(timezone.utc),
                    "activity_count": (getattr(user, 'activity_count', 0) + 1)
                })
                logger.info(f"Updated analytics for user {user_id}")
            else:
                logger.warning(f"User {user_id} not found for analytics")

            logger.info(f"Analytics processed for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Analytics processing failed for user {user_id}: {e}")
            raise

    return asyncio.run(_analytics_async())


@dramatiq.actor(max_retries=3, store_results=True)
def ensure_ri_delete_role(role_id: str) -> dict:
    """
    Remove a role from all users who have it (referential integrity cleanup)
    This is a Dramatiq task that runs async database operations.

    Note: This task is resilient to the role already being deleted,
    as it focuses on cleaning up user references.
    """
    async def _cleanup_role_references():
        try:
            logger.info(f"Starting referential integrity cleanup for role: {role_id}")

            # Find users who have this role (even if role is already deleted)
            users_with_role = await User.has_role(role_id)
            updated_users = []
            failed_updates = []

            if not users_with_role:
                logger.info(f"No users found with role {role_id}, cleanup complete")
                return {
                    "role_id": role_id,
                    "users_updated": 0,
                    "updated_user_ids": [],
                    "failed_updates": [],
                    "success": True
                }

            for user in users_with_role:
                try:
                    if user and hasattr(user, 'roles'):
                        original_role_count = len(user.roles)
                        filtered_roles = [role for role in user.roles if str(role) != str(role_id)]

                        if len(filtered_roles) != original_role_count:
                            user.roles = filtered_roles
                            await user.save()
                            updated_users.append(user.id)
                            logger.info(f"Removed role {role_id} from user {user.email}")
                        else:
                            logger.debug(f"User {user.email} did not have role {role_id}")
                except Exception as user_error:
                    logger.error(f"Failed to update user {getattr(user, 'email', 'unknown')}: {user_error}")
                    failed_updates.append({
                        "user_id": str(getattr(user, 'id', 'unknown')),
                        "error": str(user_error)
                    })

            result = {
                "role_id": role_id,
                "users_updated": len(updated_users),
                "updated_user_ids": [str(uid) for uid in updated_users],
                "failed_updates": failed_updates,
                "success": len(failed_updates) == 0
            }

            if failed_updates:
                logger.warning(f"Referential integrity cleanup completed with {len(failed_updates)} failures. Updated {len(updated_users)} users.")
            else:
                logger.info(f"Referential integrity cleanup completed successfully. Updated {len(updated_users)} users.")

            return result

        except Exception as e:
            logger.error(f"Referential integrity cleanup failed for role {role_id}: {e}")
            return {
                "role_id": role_id,
                "users_updated": 0,
                "updated_user_ids": [],
                "failed_updates": [],
                "success": False,
                "error": str(e)
            }

    return asyncio.run(_cleanup_role_references())