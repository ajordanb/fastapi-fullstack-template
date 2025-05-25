from typing import List

from fastapi import APIRouter, HTTPException, Query, Depends

from app.models.role.model import RoleOut, RoleBase, Role
from app.models.user.model import User
from app.models.util.model import Message, MessageType
from app.tasks.ensure_ri_delete_role import ensure_ri_delete_role
from app.utills.dependencies import CheckScope, admin_access

role_router = APIRouter(tags=["User Role Management"], prefix="/role", dependencies=[Depends(admin_access)])
manage_roles = Depends(CheckScope("role.write"))


@role_router.post("/all", response_model=List[RoleOut], dependencies=[manage_roles])
async def get_all_roles(
        skip: int = Query(0, ge=0),
        limit: int = Query(100, le=1000)
) -> List[RoleOut]:
    roles = await Role.all_roles(skip=skip, limit=limit)
    return [RoleOut.model_validate(role.model_dump()) for role in roles]


@role_router.post("/by_id", response_model=RoleOut, dependencies=[manage_roles])
async def get_role_by_id(
        role_id: str
) -> RoleOut:
    role = await Role.by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return RoleOut.model_validate(role.model_dump())


@role_router.post("/create", response_model=RoleOut, dependencies=[manage_roles])
async def create_role(
        role_data: RoleBase,
        current_admin: User =Depends(admin_access)
) -> RoleOut:
    existing_role = await Role.by_name(role_data.name)
    if existing_role:
        raise HTTPException(status_code=400, detail="Role name already exists")
    role_data.created_by = current_admin.email
    new_role = Role(**role_data.model_dump())
    await new_role.insert()
    return RoleOut.model_validate(new_role.model_dump())


@role_router.post("/update", response_model=RoleOut, dependencies=[manage_roles])  # Fixed response_model
async def update_role(
        role_id: str,
        role_data: RoleBase
) -> RoleOut:
    role = await Role.by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    update_data = role_data.model_dump(exclude_unset=True)
    await role.update({"$set": update_data})
    result = await Role.by_id(role_id)
    return RoleOut.model_validate(result.model_dump())


@role_router.post("/delete", dependencies=[manage_roles])
async def delete_role(
        role_id: str
) -> Message:
    role = await Role.by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    await ensure_ri_delete_role(role_id)
    await role.delete()
    return Message(message="Role deleted successfully", type=MessageType.success)