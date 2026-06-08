'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import type { EmployeeProfile } from '@/types/auth';

export default function MyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted || !user) return;

        setEmail(user.email || '');
        const { data, error } = await supabase
          .from('employee_profiles')
          .select(
            'id,store_id,user_id,full_name,phone,position,role,is_active,approval_status,approved_at,approved_by,last_login_at,created_at,updated_at',
          )
          .eq('user_id', user.id)
          .single();

        if (!isMounted) return;

        if (error || !data) {
          setStatus('프로필을 불러오지 못했습니다.');
          return;
        }

        const nextProfile = data as EmployeeProfile;
        setProfile(nextProfile);
        setFullName(nextProfile.full_name);
        setPhone(nextProfile.phone || '');
        setPosition(nextProfile.position || '');
      } catch {
        if (!isMounted) return;
        setStatus('계정 정보를 확인하는 중 오류가 발생했습니다. 새로고침 후 다시 시도하세요.');
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveProfile = async () => {
    if (!profile) return;
    if (!fullName.trim()) {
      setStatus('직원 이름은 비워둘 수 없습니다.');
      return;
    }

    setIsSaving(true);
    setStatus('저장 중입니다.');

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.rpc('update_my_employee_profile', {
        full_name_arg: fullName.trim(),
        phone_arg: phone.trim(),
        position_arg: position.trim(),
      });

      setIsSaving(false);

      if (error || !data) {
        setStatus('저장에 실패했습니다.');
        return;
      }

      setProfile(data as EmployeeProfile);
      setStatus('마이페이지 정보가 저장되었습니다.');
    } catch {
      setIsSaving(false);
      setStatus('저장 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.');
    }
  };

  const signOut = async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // 로그인 화면으로 이동해 브라우저에 남은 세션 상태를 정리하게 합니다.
    }
    router.replace('/login');
  };

  return (
    <main className="page-shell">
      <section className="page-header-row">
        <div>
          <p className="eyebrow">MY PAGE</p>
          <h1>마이페이지</h1>
          <p className="subtitle">직원 본인 정보와 계정 상태를 확인합니다.</p>
        </div>
        <div className="actions">
          <Link className="btn" href="/">
            대시보드
          </Link>
          <Link className="btn" href="/tasks">
            내 업무
          </Link>
          {profile?.role === 'admin' ? (
            <Link className="btn" href="/admin">
              관리자페이지
            </Link>
          ) : null}
          <button className="btn" type="button" onClick={signOut}>
            로그아웃
          </button>
        </div>
      </section>

      <section className="profile-layout">
        <div className="panel profile-card">
          <div className="section-title">
            <h2>계정 정보</h2>
            <span className={`status ${profile?.role === 'admin' ? 'good' : 'mid'}`}>
              {profile?.role === 'admin' ? '관리자' : '직원'}
            </span>
          </div>
          <dl className="profile-summary">
            <div>
              <dt>이메일</dt>
              <dd>{email || '-'}</dd>
            </div>
            <div>
              <dt>계정 상태</dt>
              <dd>
                {profile?.approval_status === 'approved' && profile.is_active
                  ? '사용 가능'
                  : profile?.approval_status === 'pending'
                    ? '승인 대기'
                    : '비활성'}
              </dd>
            </div>
            <div>
              <dt>승인 상태</dt>
              <dd>{profile?.approval_status === 'approved' ? '승인 완료' : profile?.approval_status === 'pending' ? '승인 대기' : '반려'}</dd>
            </div>
            <div>
              <dt>최근 로그인</dt>
              <dd>{profile?.last_login_at ? new Date(profile.last_login_at).toLocaleString('ko-KR') : '기록 없음'}</dd>
            </div>
          </dl>
        </div>

        <div className="panel">
          <div className="section-title">
            <h2>직원 정보 수정</h2>
            <span className="pill">본인 정보</span>
          </div>
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              saveProfile();
            }}
          >
            <div className="form-field">
              <label htmlFor="my-name">직원 이름</label>
              <input id="my-name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor="my-position">직무/포지션</label>
              <input id="my-position" value={position} onChange={(event) => setPosition(event.target.value)} />
            </div>
            <div className="form-field full">
              <label htmlFor="my-phone">연락처</label>
              <input id="my-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="form-actions">
              <button className="btn primary" disabled={isSaving || !profile} type="submit">
                저장
              </button>
              {status ? <span className="save-status">{status}</span> : null}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
