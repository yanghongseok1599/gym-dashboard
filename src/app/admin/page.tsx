import AdminPage from '@/components/AdminPage';
import AuthGate from '@/components/AuthGate';

export default function AdminPageRoute() {
  return (
    <AuthGate requiredRole="admin">
      <AdminPage />
    </AuthGate>
  );
}
