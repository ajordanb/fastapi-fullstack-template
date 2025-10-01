from typing import List
from fastapi import HTTPException
from starlette import status

from app.models.role.model import Role, RoleBase, RoleOut
from app.models.util.model import Message


class RoleService:
    """Service for retrieving and updating roles"""

    def __init__(self):
        pass

    async def get_all_roles(self, skip: int = 0, limit: int = 1000) -> List[RoleOut]:
        """Get all roles with pagination"""
        roles = await Role.all_roles(skip, limit)
        return [RoleOut.model_validate(role.model_dump()) for role in roles]

    async def get_role_by_id(self, role_id: str) -> RoleOut:
        """Get a role by its ID"""
        role = await Role.by_id(role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        return RoleOut.model_validate(role.model_dump())

    async def get_role_by_name(self, name: str) -> Role:
        """Get a role by its name"""
        role = await Role.by_name(name)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        return role

    async def create_role(self, role_data: RoleBase, created_by: str) -> RoleOut:
        """Create a new role"""
        existing_role = await Role.by_name(role_data.name)
        if existing_role:
            raise HTTPException(
                status_code=400,
                detail="Role name already exists",
            )

        role_data.created_by = created_by
        new_role = Role(**role_data.model_dump())
        await new_role.insert()
        return RoleOut.model_validate(new_role.model_dump())

    async def update_role(self, role_id: str, role_update: RoleBase) -> RoleOut:
        """Update an existing role"""
        role = await Role.by_id(role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        # Check if updating name to an existing name
        if role_update.name and role_update.name != role.name:
            existing_role = await Role.by_name(role_update.name)
            if existing_role:
                raise HTTPException(status_code=400, detail="Role name already exists")

        update_data = role_update.model_dump(exclude_unset=True)
        await role.update({"$set": update_data})

        # Fetch updated role
        updated_role = await Role.by_id(role_id)
        return RoleOut.model_validate(updated_role.model_dump())

    async def delete_role(self, role_id: str) -> Message:
        """Delete a role"""
        role = await Role.by_id(role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        # Note: Role deletion should handle referential integrity
        # This should be done through the existing ensure_ri_delete_role task
        await role.delete()
        return Message(message="Role deleted successfully")

    async def role_exists(self, role_id: str) -> bool:
        """Check if a role exists by ID"""
        role = await Role.by_id(role_id)
        return role is not None

    async def get_roles_by_ids(self, role_ids: List[str]) -> List[Role]:
        """Get multiple roles by their IDs"""
        roles = []
        for role_id in role_ids:
            role = await Role.by_id(role_id)
            if role:
                roles.append(role)
        return roles