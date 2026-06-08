'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import type { ApprovalStatus, EmployeeProfile, EmployeeRole, TaskPriority, TaskStatus, WeeklyTask } from '@/types/auth';

const storeId = process.env.NEXT_PUBLIC_SUPABASE_STORE_ID || '00000000-0000-4000-8000-000000000001';

const approvalLabels: Record<ApprovalStatus, string> = {
  pending: '승인 대기',
  approved: '승인 완료',
  rejected: '반려',
};

const statusLabels: Record<TaskStatus, string> = {
  todo: '대기',
  in_progress: '진행중',
  done: '완료',
  blocked: '보류',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
};

type TaskForm = {
  assigneeProfileId: string;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  priority: TaskPriority;
};

const emptyTaskForm: TaskForm = {
  assigneeProfileId: '',
  title: '',
  description: '',
  category: '',
  dueDate: '',
  priority: 'medium',
};

export default function AdminPage() {
  const [profiles, setProfiles] = useState<EmployeeProfile[]>([]);
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [taskForm, setTaskForm] = useState<TaskForm>(emptyTaskForm);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = async () => {
    const supabase = getSupabaseClient();
    setIsLoading(true);

    const [profilesResult, tasksResult] = await Promise.all([
      supabase
        .from('employee_profiles')
        .select(
          'id,store_id,user_id,full_name,phone,position,role,is_active,approval_status,approved_at,approved_by,last_login_at,created_at,updated_at',
        )
        .eq('store_id', storeId)
        .order('created_at', { ascending: true }),
      supabase
        .from('weekly_tasks')
        .select(
          'id,store_id,report_id,staff_id,assignee_profile_id,title,description,priority,category,due_date,status,completion_note,ai_reason,created_at,updated_at',
        )
        .eq('store_id', storeId)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false }),
    ]);

    setIsLoading(false);

    if (profilesResult.error || tasksResult.error) {
      setStatus('관리자 데이터를 불러오지 못했습니다.');
      return;
    }

    const nextProfiles = (profilesResult.data || []) as EmployeeProfile[];
    setProfiles(nextProfiles);
    setTasks((tasksResult.data || []) as WeeklyTask[]);

    const firstApprovedEmployee = nextProfiles.find((profile) => profile.approval_status === 'approved' && profile.is_active);
    if (firstApprovedEmployee && !taskForm.assigneeProfileId) {
      setTaskForm((form) => ({ ...form, assigneeProfileId: firstApprovedEmployee.id }));
    }

    setStatus('');
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const updateProfile = async (profile: EmployeeProfile, changes: Partial<EmployeeProfile>) => {
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const nextApprovalStatus = (changes.approval_status ?? profile.approval_status) as ApprovalStatus;

    setStatus(`${profile.full_name} 계정을 저장 중입니다.`);

    const { data, error } = await supabase
      .from('employee_profiles')
      .update({
        role: changes.role ?? profile.role,
        is_active: changes.is_active ?? profile.is_active,
        approval_status: nextApprovalStatus,
        approved_at: nextApprovalStatus === 'approved' ? profile.approved_at || new Date().toISOString() : profile.approved_at,
        approved_by: nextApprovalStatus === 'approved' ? profile.approved_by || user?.id || null : profile.approved_by,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)
      .select(
        'id,store_id,user_id,full_name,phone,position,role,is_active,approval_status,approved_at,approved_by,last_login_at,created_at,updated_at',
      )
      .single();

    if (error || !data) {
      setStatus('계정 저장에 실패했습니다.');
      return;
    }

    setProfiles((items) => items.map((item) => (item.id === profile.id ? (data as EmployeeProfile) : item)));
    setStatus(`${profile.full_name} 계정이 저장되었습니다.`);
  };

  const approveProfile = (profile: EmployeeProfile) =>
    updateProfile(profile, {
      approval_status: 'approved',
      is_active: true,
    });

  const rejectProfile = (profile: EmployeeProfile) =>
    updateProfile(profile, {
      approval_status: 'rejected',
      is_active: false,
    });

  const createTask = async () => {
    if (!taskForm.assigneeProfileId || !taskForm.title.trim() || !taskForm.description.trim()) {
      setStatus('담당 직원, 업무명, 업무 내용을 입력해야 배정할 수 있습니다.');
      return;
    }

    const supabase = getSupabaseClient();
    setStatus('업무를 배정하는 중입니다.');

    const { data, error } = await supabase
      .from('weekly_tasks')
      .insert({
        store_id: storeId,
        assignee_profile_id: taskForm.assigneeProfileId,
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        priority: taskForm.priority,
        category: taskForm.category.trim() || '운영',
        due_date: taskForm.dueDate || null,
        status: 'todo',
      })
      .select(
        'id,store_id,report_id,staff_id,assignee_profile_id,title,description,priority,category,due_date,status,completion_note,ai_reason,created_at,updated_at',
      )
      .single();

    if (error || !data) {
      setStatus('업무 배정에 실패했습니다.');
      return;
    }

    setTasks((items) => [data as WeeklyTask, ...items]);
    setTaskForm((form) => ({ ...emptyTaskForm, assigneeProfileId: form.assigneeProfileId }));
    setStatus('업무가 배정되었습니다.');
  };

  const updateTaskStatus = async (task: WeeklyTask, nextStatus: TaskStatus) => {
    const supabase = getSupabaseClient();
    setStatus(`${task.title} 상태를 저장 중입니다.`);

    const { data, error } = await supabase
      .from('weekly_tasks')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', task.id)
      .select(
        'id,store_id,report_id,staff_id,assignee_profile_id,title,description,priority,category,due_date,status,completion_note,ai_reason,created_at,updated_at',
      )
      .single();

    if (error || !data) {
      setStatus('업무 상태 저장에 실패했습니다.');
      return;
    }

    setTasks((items) => items.map((item) => (item.id === task.id ? (data as WeeklyTask) : item)));
    setStatus(`${task.title} 상태가 저장되었습니다.`);
  };

  const activeProfiles = profiles.filter((profile) => profile.approval_status === 'approved' && profile.is_active);
  const pendingCount = profiles.filter((profile) => profile.approval_status === 'pending').length;
  const adminCount = profiles.filter((profile) => profile.role === 'admin' && profile.is_active && profile.approval_status === 'approved').length;
  const openTaskCount = tasks.filter((task) => task.status === 'todo' || task.status === 'in_progress').length;
  const blockedTaskCount = tasks.filter((task) => task.status === 'blocked').length;

  const profileNames = useMemo(
    () => Object.fromEntries(profiles.map((profile) => [profile.id, profile.full_name])),
    [profiles],
  );

  const employeeTaskStats = activeProfiles.map((profile) => {
    const assigned = tasks.filter((task) => task.assignee_profile_id === profile.id);
    const done = assigned.filter((task) => task.status === 'done').length;
    const blocked = assigned.filter((task) => task.status === 'blocked').length;
    const completionRate = assigned.length ? Math.round((done / assigned.length) * 100) : 0;
    return { profile, assigned: assigned.length, done, blocked, completionRate };
  });

  return (
    <main className="page-shell">
      <section className="page-header-row">
        <div>
          <p className="eyebrow">ADMIN</p>
          <h1>관리자페이지</h1>
          <p className="subtitle">직원 가입 승인, 권한 관리, 업무 배정과 진행률을 관리합니다.</p>
        </div>
        <div className="actions">
          <Link className="btn" href="/">
            대시보드
          </Link>
          <Link className="btn" href="/tasks">
            내 업무
          </Link>
          <Link className="btn" href="/mypage">
            마이페이지
          </Link>
          <button className="btn" type="button" onClick={loadAdminData}>
            새로고침
          </button>
        </div>
      </section>

      <section className="grid cards admin-metrics">
        <div className="panel">
          <div className="metric-label">승인 대기</div>
          <div className="metric-value">{pendingCount}명</div>
          <div className="metric-delta warn">가입 신청</div>
        </div>
        <div className="panel">
          <div className="metric-label">활성 직원</div>
          <div className="metric-value">{activeProfiles.length}명</div>
          <div className="metric-delta up">로그인 가능</div>
        </div>
        <div className="panel">
          <div className="metric-label">미완료 업무</div>
          <div className="metric-value">{openTaskCount}건</div>
          <div className="metric-delta warn">대기/진행중</div>
        </div>
        <div className="panel">
          <div className="metric-label">보류 업무</div>
          <div className="metric-value">{blockedTaskCount}건</div>
          <div className="metric-delta down">관리자 확인</div>
        </div>
      </section>

      <section className="grid two-col admin-section-grid">
        <section className="panel">
          <div className="section-title">
            <h2>직원 가입 승인</h2>
            <span className="pill">{isLoading ? '불러오는 중' : `${pendingCount}명 대기`}</span>
          </div>
          <div className="approval-list">
            {profiles.length ? (
              profiles.map((profile) => (
                <div className="approval-item" key={profile.id}>
                  <div>
                    <strong>{profile.full_name}</strong>
                    <p>{profile.position || '직무 미입력'} · {profile.phone || '연락처 미입력'}</p>
                    <div className="task-badges">
                      <span className={`status ${profile.approval_status === 'approved' ? 'good' : profile.approval_status === 'pending' ? 'mid' : 'bad'}`}>
                        {approvalLabels[profile.approval_status]}
                      </span>
                      <span className="pill">{profile.role === 'admin' ? '관리자' : '직원'}</span>
                      <span className={`status ${profile.is_active ? 'good' : 'bad'}`}>{profile.is_active ? '활성' : '비활성'}</span>
                    </div>
                  </div>
                  <div className="approval-actions">
                    {profile.approval_status !== 'approved' ? (
                      <button className="table-action" type="button" onClick={() => approveProfile(profile)}>
                        승인
                      </button>
                    ) : null}
                    {profile.approval_status === 'pending' ? (
                      <button className="table-action danger" type="button" onClick={() => rejectProfile(profile)}>
                        반려
                      </button>
                    ) : null}
                    <button
                      className={`table-action ${profile.is_active ? 'danger' : ''}`}
                      type="button"
                      onClick={() =>
                        updateProfile(profile, {
                          is_active: !profile.is_active,
                          approval_status: !profile.is_active ? 'approved' : profile.approval_status,
                        })
                      }
                    >
                      {profile.is_active ? '비활성' : '활성'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-panel compact">
                <h2>{isLoading ? '직원 계정을 불러오는 중입니다.' : '가입 신청이 없습니다.'}</h2>
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="section-title">
            <h2>업무 배정</h2>
            <span className="pill">관리자 입력</span>
          </div>
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              createTask();
            }}
          >
            <div className="form-field">
              <label htmlFor="task-assignee">담당 직원</label>
              <select
                id="task-assignee"
                value={taskForm.assigneeProfileId}
                onChange={(event) => setTaskForm((form) => ({ ...form, assigneeProfileId: event.target.value }))}
              >
                <option value="">직원 선택</option>
                {activeProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="task-priority">우선순위</label>
              <select
                id="task-priority"
                value={taskForm.priority}
                onChange={(event) => setTaskForm((form) => ({ ...form, priority: event.target.value as TaskPriority }))}
              >
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="task-title">업무명</label>
              <input
                id="task-title"
                value={taskForm.title}
                onChange={(event) => setTaskForm((form) => ({ ...form, title: event.target.value }))}
                placeholder="예: 만료 30일 회원 재등록 연락"
              />
            </div>
            <div className="form-field">
              <label htmlFor="task-category">분류</label>
              <input
                id="task-category"
                value={taskForm.category}
                onChange={(event) => setTaskForm((form) => ({ ...form, category: event.target.value }))}
                placeholder="예: 재등록, 콘텐츠, 상담"
              />
            </div>
            <div className="form-field">
              <label htmlFor="task-due">마감일</label>
              <input
                id="task-due"
                type="date"
                value={taskForm.dueDate}
                onChange={(event) => setTaskForm((form) => ({ ...form, dueDate: event.target.value }))}
              />
            </div>
            <div className="form-field full">
              <label htmlFor="task-description">업무 내용</label>
              <textarea
                id="task-description"
                value={taskForm.description}
                onChange={(event) => setTaskForm((form) => ({ ...form, description: event.target.value }))}
                placeholder="직원이 바로 실행할 수 있게 대상, 기준, 결과 기록 방식을 적어주세요."
              />
            </div>
            <div className="form-actions">
              <button className="btn primary" type="submit">
                업무 배정
              </button>
            </div>
          </form>
        </section>
      </section>

      <section className="panel admin-table-panel">
        <div className="section-title">
          <h2>직원 계정 관리</h2>
          <span className="pill">{adminCount}명 관리자</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>직원</th>
              <th>직무</th>
              <th>연락처</th>
              <th>승인</th>
              <th>권한</th>
              <th>상태</th>
              <th>최근 로그인</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length ? (
              profiles.map((profile) => (
                <tr key={profile.id}>
                  <td>
                    <strong>{profile.full_name}</strong>
                    <span className="table-subtext">{profile.user_id.slice(0, 8)}</span>
                  </td>
                  <td>{profile.position || '-'}</td>
                  <td>{profile.phone || '-'}</td>
                  <td>{approvalLabels[profile.approval_status]}</td>
                  <td>
                    <select
                      aria-label={`${profile.full_name} 권한`}
                      value={profile.role}
                      onChange={(event) => updateProfile(profile, { role: event.target.value as EmployeeRole })}
                    >
                      <option value="employee">직원</option>
                      <option value="admin">관리자</option>
                    </select>
                  </td>
                  <td>{profile.is_active ? '활성' : '비활성'}</td>
                  <td>{profile.last_login_at ? new Date(profile.last_login_at).toLocaleString('ko-KR') : '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>{isLoading ? '직원 계정을 불러오는 중입니다.' : '가입한 직원 계정이 없습니다.'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="grid two-col admin-section-grid">
        <section className="panel admin-table-panel">
          <div className="section-title">
            <h2>직원별 업무 현황</h2>
            <span className="pill">완료율</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>직원</th>
                <th>배정</th>
                <th>완료</th>
                <th>보류</th>
                <th>완료율</th>
              </tr>
            </thead>
            <tbody>
              {employeeTaskStats.length ? (
                employeeTaskStats.map(({ profile, assigned, done, blocked, completionRate }) => (
                  <tr key={profile.id}>
                    <td>{profile.full_name}</td>
                    <td>{assigned}건</td>
                    <td>{done}건</td>
                    <td>{blocked}건</td>
                    <td>{completionRate}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>승인된 직원이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="panel admin-table-panel">
          <div className="section-title">
            <h2>전체 업무 목록</h2>
            <span className="pill">{tasks.length}건</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>업무</th>
                <th>담당</th>
                <th>우선순위</th>
                <th>마감</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length ? (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <strong>{task.title}</strong>
                      <span className="table-subtext">{task.category || '운영'}</span>
                    </td>
                    <td>{task.assignee_profile_id ? profileNames[task.assignee_profile_id] || '-' : '-'}</td>
                    <td>{priorityLabels[task.priority]}</td>
                    <td>{task.due_date ? new Date(task.due_date).toLocaleDateString('ko-KR') : '-'}</td>
                    <td>
                      <select
                        aria-label={`${task.title} 상태`}
                        value={task.status}
                        onChange={(event) => updateTaskStatus(task, event.target.value as TaskStatus)}
                      >
                        <option value="todo">대기</option>
                        <option value="in_progress">진행중</option>
                        <option value="done">완료</option>
                        <option value="blocked">보류</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>아직 배정된 업무가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </section>

      {status ? <p className="save-status admin-status">{status}</p> : null}
    </main>
  );
}
