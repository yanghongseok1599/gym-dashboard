'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

type AuthMode = 'signin' | 'signup' | 'forgot';

const getFriendlyAuthError = (message: string, mode: AuthMode) => {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return '이메일 또는 비밀번호가 맞지 않습니다. 이미 가입 신청한 이메일이라면 비밀번호 찾기로 새 비밀번호를 설정하세요.';
  }

  if (normalized.includes('email not confirmed')) {
    return '이메일 인증이 완료되지 않았습니다. 메일함에서 인증 링크를 확인한 뒤 다시 로그인하세요.';
  }

  if (normalized.includes('already registered') || normalized.includes('user already registered')) {
    return '이미 등록된 이메일입니다. 로그인하거나 비밀번호 찾기로 새 비밀번호를 설정하세요.';
  }

  if (mode === 'signup' && normalized.includes('database error')) {
    return '가입 신청 저장 중 문제가 발생했습니다. 관리자에게 계정 확인을 요청하세요.';
  }

  return message;
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submitAuth = async () => {
    const supabase = getSupabaseClient();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setStatus('이메일을 입력하세요.');
      return;
    }

    if (mode !== 'forgot' && !password) {
      setStatus('비밀번호를 입력하세요.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setStatus('직원 이름을 입력해야 가입할 수 있습니다.');
      return;
    }

    setIsSubmitting(true);
    setStatus(
      mode === 'signin'
        ? '로그인 중입니다.'
        : mode === 'signup'
          ? '직원 계정을 생성하는 중입니다.'
          : '비밀번호 재설정 메일을 보내는 중입니다.',
    );

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;

        setStatus('비밀번호 재설정 메일을 보냈습니다. 메일의 링크를 눌러 새 비밀번호를 설정하세요.');
        return;
      }

      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) throw error;

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase
            .from('employee_profiles')
            .update({ last_login_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        }

        router.replace('/');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            position: position.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.user && data.user.identities?.length === 0) {
        setStatus('이미 등록된 이메일입니다. 로그인하거나 비밀번호 찾기로 새 비밀번호를 설정하세요.');
        setMode('signin');
        return;
      }

      if (data.session) {
        router.replace('/mypage');
        return;
      }

      setStatus('가입 신청이 완료되었습니다. 관리자가 승인하면 대시보드를 사용할 수 있습니다.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '인증 처리 중 오류가 발생했습니다.';
      setStatus(getFriendlyAuthError(message, mode));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDashboard = async () => {
    try {
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setStatus('로그인 후 대시보드를 사용할 수 있습니다.');
        return;
      }

      router.push('/');
    } catch {
      setStatus('로그인 상태를 확인하지 못했습니다. 새로고침 후 다시 시도하세요.');
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-logo">GD</div>
        <div className="auth-heading">
          <h1>{mode === 'signin' ? '직원 로그인' : mode === 'signup' ? '직원 회원가입' : '비밀번호 찾기'}</h1>
          <p>ITN 피트니스 내부 대시보드입니다. 직원은 이메일과 비밀번호로 간단히 가입하고 사용할 수 있습니다.</p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="인증 방식">
          <button className={mode === 'signin' ? 'active' : ''} type="button" onClick={() => setMode('signin')}>
            로그인
          </button>
          <button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => setMode('signup')}>
            회원가입
          </button>
        </div>

        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault();
            submitAuth();
          }}
        >
          {mode === 'signup' ? (
            <>
              <label>
                직원 이름
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="예: 김재민" />
              </label>
              <label>
                직무/포지션
                <input value={position} onChange={(event) => setPosition(event.target.value)} placeholder="예: PT 트레이너" />
              </label>
              <label>
                연락처
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="예: 010-0000-0000" />
              </label>
            </>
          ) : null}

          <label>
            이메일
            <input
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </label>
          {mode !== 'forgot' ? (
            <label>
              비밀번호
              <span className="password-input-wrap">
                <input
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="6자 이상"
                />
                <button
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  aria-pressed={showPassword}
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? '숨기기' : '보기'}
                </button>
              </span>
            </label>
          ) : null}

          <button className="btn primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? '처리 중' : mode === 'signin' ? '로그인' : mode === 'signup' ? '회원가입' : '재설정 메일 보내기'}
          </button>
          {mode === 'signin' ? (
            <button className="text-button" type="button" onClick={() => setMode('forgot')}>
              비밀번호를 잊으셨나요?
            </button>
          ) : null}
          {mode === 'forgot' ? (
            <button className="text-button" type="button" onClick={() => setMode('signin')}>
              로그인으로 돌아가기
            </button>
          ) : null}
          {status ? <p className="auth-status">{status}</p> : null}
        </form>

        <div className="auth-footer">
          <button type="button" onClick={openDashboard}>
            대시보드로 돌아가기
          </button>
        </div>
      </section>
    </main>
  );
}
