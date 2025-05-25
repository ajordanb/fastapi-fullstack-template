from app.models.user.model import User
from app.utills.util import fire_and_forget


@fire_and_forget
async def ensure_ri_delete_role(role_id):
    """
    Remove a role from all users who have it (referential integrity cleanup)
    """
    users_with_role = await User.has_role(role_id)
    for user in users_with_role:
        if user:
            filtered_roles = [role for role in user.roles if str(role) != str(role_id)]
            user.roles = filtered_roles
            await user.save()
    return users_with_role