import {Outlet} from "@tanstack/react-router";

export function ManagerLayout() {
  return (
    <div>
      <nav className="bg-blue-100 p-4">
        <h2>Manager Section</h2>
      </nav>
      <Outlet />
    </div>
  );
}