import AuthGate from '@/components/AuthGate';
import MyPage from '@/components/MyPage';

export default function MyPageRoute() {
  return (
    <AuthGate>
      <MyPage />
    </AuthGate>
  );
}
