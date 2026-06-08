'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import type { EmployeeProfile, EmployeeRole } from '@/types/auth';

type AuthGateProps = {
  children: ReactNode;
  requiredRole?: EmployeeRole;
};

export default function AuthGate({ children, requiredRole }: AuthGateProps) {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'allowed' | 'denied'>('loading');
  const [message, setMessage] = useState('로그인 상태를 확인하는 중입니다.');
  const [deniedAction, setDeniedAction] = useState<'login' | 'logout' | 'home'>('login');

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const checkSession = async () => {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (!session?.user) {
          router.replace('/login');
          return;
        }

        const { data, error } = await supabase
          .from('employee_profiles')
          .select(
            'id,store_id,user_id,full_name,phone,position,role,is_active,approval_status,approved_at,approved_by,last_login_at,created_at,updated_at',
          )
          .eq('user_id', session.user.id)
          .single();

        if (!isMounted) return;

        if (error || !data) {
          setMessage('직원 프로필을 찾을 수 없습니다. 관리자에게 계정 확인을 요청하세요.');
          setState('denied');
          return;
        }

        const profile = data as EmployeeProfile;
        if (profile.approval_status === 'pending') {
          setMessage('가입 신청이 접수되었습니다. 관리자가 승인하면 대시보드를 사용할 수 있습니다.');
          setDeniedAction('logout');
          setState('denied');
          return;
        }

        if (profile.approval_status === 'rejected') {
          setMessage('가입 신청이 반려된 계정입니다. 관리자에게 문의하세요.');
          setDeniedAction('logout');
          setState('denied');
          return;
        }

        if (!profile.is_active) {
          setMessage('비활성화된 직원 계정입니다. 관리자에게 문의하세요.');
          setDeniedAction('logout');
          setState('denied');
          return;
        }

        if (requiredRole && profile.role !== requiredRole) {
          setMessage('관리자 권한이 필요한 페이지입니다.');
          setDeniedAction('home');
          setState('denied');
          return;
        }

        setState('allowed');
      } catch {
        if (!isMounted) return;
        setDeniedAction('login');
        setMessage('인증 정보를 확인하는 중 오류가 발생했습니다. 새로고침하거나 다시 로그인하세요.');
        setState('denied');
      }
    };

    checkSession();

    try {
      const supabase = getSupabaseClient();
      const authListener = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') router.replace('/login');
        if (event === 'SIGNED_IN') checkSession();
      });
      subscription = authListener.data.subscription;
    } catch {
      setDeniedAction('login');
      setMessage('인증 설정을 불러오지 못했습니다. 배포 설정을 확인한 뒤 다시 접속하세요.');
      setState('denied');
    }

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [requiredRole, router]);

  if (state === 'allowed') return <>{children}</>;

  return (
    <main className="auth-shell">
      <section className="auth-card compact">
        <div className="auth-logo">GD</div>
        <h1>{state === 'loading' ? '확인 중' : '접근 제한'}</h1>
        <p>{message}</p>
        {state === 'denied' ? (
          <div className="auth-actions-inline">
            {deniedAction === 'logout' ? (
              <button
                className="btn primary"
                type="button"
                onClick={async () => {
                  await getSupabaseClient().auth.signOut();
                  router.push('/login');
                }}
              >
                로그아웃
              </button>
            ) : (
              <button className="btn primary" type="button" onClick={() => router.push('/login')}>
                로그인으로 이동
              </button>
            )}
            {deniedAction === 'home' ? (
              <button className="btn" type="button" onClick={() => router.push('/')}>
                대시보드
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
