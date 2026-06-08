'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('재설정 링크를 확인하는 중입니다.');
  const [canReset, setCanReset] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let isMounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (session?.user) {
        setCanReset(true);
        setStatus('새 비밀번호를 입력하세요.');
      } else {
        setCanReset(false);
        setStatus('재설정 링크가 만료되었거나 유효하지 않습니다. 비밀번호 찾기를 다시 요청하세요.');
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setCanReset(true);
        setStatus('새 비밀번호를 입력하세요.');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const savePassword = async () => {
    if (!canReset) {
      setStatus('비밀번호 찾기를 다시 요청하세요.');
      return;
    }

    if (password.length < 6) {
      setStatus('비밀번호는 6자 이상으로 입력하세요.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('새 비밀번호와 확인값이 다릅니다.');
      return;
    }

    const supabase = getSupabaseClient();
    setIsSaving(true);
    setStatus('새 비밀번호를 저장하는 중입니다.');

    const { error } = await supabase.auth.updateUser({ password });
    setIsSaving(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    await supabase.auth.signOut();
    setStatus('비밀번호가 변경되었습니다. 새 비밀번호로 로그인하세요.');
    setTimeout(() => router.replace('/login'), 900);
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-logo">GD</div>
        <div className="auth-heading">
          <h1>새 비밀번호 설정</h1>
          <p>메일로 받은 재설정 링크가 열린 상태에서 새 비밀번호를 저장합니다.</p>
        </div>

        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault();
            savePassword();
          }}
        >
          <label>
            새 비밀번호
            <span className="password-input-wrap">
              <input
                autoComplete="new-password"
                disabled={!canReset}
                minLength={6}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="6자 이상"
              />
              <button
                aria-label={showPassword ? '새 비밀번호 숨기기' : '새 비밀번호 보기'}
                aria-pressed={showPassword}
                className="password-toggle"
                disabled={!canReset}
                type="button"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? '숨기기' : '보기'}
              </button>
            </span>
          </label>
          <label>
            새 비밀번호 확인
            <span className="password-input-wrap">
              <input
                autoComplete="new-password"
                disabled={!canReset}
                minLength={6}
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="한 번 더 입력"
              />
              <button
                aria-label={showConfirmPassword ? '비밀번호 확인 숨기기' : '비밀번호 확인 보기'}
                aria-pressed={showConfirmPassword}
                className="password-toggle"
                disabled={!canReset}
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
              >
                {showConfirmPassword ? '숨기기' : '보기'}
              </button>
            </span>
          </label>
          <button className="btn primary" disabled={isSaving || !canReset} type="submit">
            {isSaving ? '저장 중' : '비밀번호 변경'}
          </button>
          <p className="auth-status">{status}</p>
        </form>

        <div className="auth-footer">
          <Link href="/login">로그인으로 돌아가기</Link>
        </div>
      </section>
    </main>
  );
}
