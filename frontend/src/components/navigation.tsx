import { Link } from '@tanstack/react-router';
import { RoleGuard } from './guards/roleGuard';

function Navigation() {
  return (
    <nav>
      <Link to="/">Dashboard</Link>
      
      <RoleGuard roles={['admin', 'manager']}>
        <Link to="/reports">Reports</Link>
      </RoleGuard>
      
      <RoleGuard roles="admin">
        <Link to="/users">User Management</Link>
      </RoleGuard>
    </nav>
  );
}