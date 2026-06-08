import AuthGate from '@/components/AuthGate';
import MyTasksPage from '@/components/MyTasksPage';

export default function TasksPage() {
  return (
    <AuthGate>
      <MyTasksPage />
    </AuthGate>
  );
}
