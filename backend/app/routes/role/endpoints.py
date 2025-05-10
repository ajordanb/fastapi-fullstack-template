from fastapi import APIRouter, HTTPException, Query, Depends

from app.shared.dependencies import CheckScope, admin_access
from app.routes.role.model import Role, RoleBase
from typing import List

from app.shared.model import Message, MessageType

role_router = APIRouter(tags=["User Role Management"], prefix="/role", dependencies=[Depends(admin_access)])
manage_roles = Depends(CheckScope("role.write"))


@role_router.post("/create", response_model=RoleBase, dependencies=[manage_roles])
async def create_role(
        role_data: RoleBase
) -> Role:
    """Create a new role"""
    existing_role = await Role.by_name(role_data.name)
    if existing_role:
        raise HTTPException(status_code=400, detail="Role name already exists")

    new_role = Role(**role_data.model_dump())
    await new_role.insert()
    return new_role


@role_router.post("/all", response_model=List[RoleBase], dependencies=[manage_roles])
async def get_all_roles(
        skip: int = Query(0, ge=0),
        limit: int = Query(100, le=1000)
) -> List[Role]:
    """Get all roles with pagination"""
    return await Role.all_roles(skip=skip, limit=limit)


@role_router.post("/by_id", response_model=RoleBase, dependencies=[manage_roles])
async def get_role_by_id(
        role_id: str
) -> Role:
    """Get tenant details by ID"""
    role = await Role.by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@role_router.post("/update", response_model=RoleBase, dependencies=[manage_roles])
async def update_role(
        role_id: str,
        role_data: RoleBase
) -> Role:
    """Update role details"""
    role = await Role.by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    update_data = role_data.model_dump(exclude_unset=True)
    await role.update({"$set": update_data})
    return await role.by_id(role_id)


@role_router.post("/delete", dependencies=[manage_roles])
async def delete_role(
        role_id: str
) -> Message:
    """Delete a role"""
    role = await Role.by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    await role.delete()
    return Message(message="Role deleted successfully", type=MessageType.success)

@role_router.post("/autoupdate_scopes", dependencies=[manage_roles])
async def autoupdate_scopes() -> Message:
    admin_role = await Role.by_name("admin")
    updated_roles = []
    if sorted(admin_role.scopes) != sorted([s.value for s in Scope]):
        admin_role.scopes = [s.value for s in Scope]
        await admin_role.save()
        updated_roles.append("admin")

    view_only_role = await Roles.by_name("view_only")
    view_only_scopes = [s.value for s in Scope if ".view" in s.value]
    if sorted(view_only_role.scopes) != sorted(view_only_scopes):
        view_only_role.scopes = view_only_scopes
        await view_only_role.save()
        updated_roles.append("view_only")

    return Message.success(f"Updated roles: {updated_roles}")
