'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import type { EmployeeProfile, TaskStatus, WeeklyTask } from '@/types/auth';

const statusLabels: Record<TaskStatus, string> = {
  todo: '대기',
  in_progress: '진행중',
  done: '완료',
  blocked: '보류',
};

const statusClassNames: Record<TaskStatus, string> = {
  todo: 'mid',
  in_progress: 'good',
  done: 'good',
  blocked: 'bad',
};

export default function MyTasksPage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = async () => {
    const supabase = getSupabaseClient();
    setIsLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profileData, error: profileError } = await supabase
      .from('employee_profiles')
      .select(
        'id,store_id,user_id,full_name,phone,position,role,is_active,approval_status,approved_at,approved_by,last_login_at,created_at,updated_at',
      )
      .eq('user_id', user.id)
      .single();

    if (profileError || !profileData) {
      setStatus('직원 프로필을 불러오지 못했습니다.');
      setIsLoading(false);
      return;
    }

    const nextProfile = profileData as EmployeeProfile;
    setProfile(nextProfile);

    const { data: taskData, error: taskError } = await supabase
      .from('weekly_tasks')
      .select(
        'id,store_id,report_id,staff_id,assignee_profile_id,title,description,priority,category,due_date,status,completion_note,ai_reason,created_at,updated_at',
      )
      .eq('assignee_profile_id', nextProfile.id)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    setIsLoading(false);

    if (taskError) {
      setStatus('업무 목록을 불러오지 못했습니다.');
      return;
    }

    const nextTasks = (taskData || []) as WeeklyTask[];
    setTasks(nextTasks);
    setNotes(Object.fromEntries(nextTasks.map((task) => [task.id, task.completion_note || ''])));
    setStatus('');
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const updateTask = async (task: WeeklyTask, nextStatus: TaskStatus) => {
    const supabase = getSupabaseClient();
    setStatus(`${task.title} 업무를 저장 중입니다.`);

    const { data, error } = await supabase.rpc('update_my_task_status', {
      task_id_arg: task.id,
      status_arg: nextStatus,
      completion_note_arg: notes[task.id] || '',
    });

    if (error || !data) {
      setStatus('업무 상태 저장에 실패했습니다.');
      return;
    }

    const updatedTask = data as WeeklyTask;
    setTasks((items) => items.map((item) => (item.id === updatedTask.id ? updatedTask : item)));
    setStatus(`${task.title} 업무가 저장되었습니다.`);
  };

  const summary = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((task) => task.status === 'done').length;
    const active = tasks.filter((task) => task.status === 'todo' || task.status === 'in_progress').length;
    const blocked = tasks.filter((task) => task.status === 'blocked').length;
    return { total, done, active, blocked };
  }, [tasks]);

  return (
    <main className="page-shell">
      <section className="page-header-row">
        <div>
          <p className="eyebrow">MY TASKS</p>
          <h1>내 업무</h1>
          <p className="subtitle">{profile?.full_name || '직원'}님에게 배정된 이번 주 업무입니다.</p>
        </div>
        <div className="actions">
          <Link className="btn" href="/">
            대시보드
          </Link>
          <Link className="btn" href="/mypage">
            마이페이지
          </Link>
          {profile?.role === 'admin' ? (
            <Link className="btn" href="/admin">
              관리자페이지
            </Link>
          ) : null}
          <button className="btn" type="button" onClick={loadTasks}>
            새로고침
          </button>
        </div>
      </section>

      <section className="grid cards admin-metrics">
        <div className="panel">
          <div className="metric-label">전체 업무</div>
          <div className="metric-value">{summary.total}건</div>
          <div className="metric-delta up">내게 배정됨</div>
        </div>
        <div className="panel">
          <div className="metric-label">진행 필요</div>
          <div className="metric-value">{summary.active}건</div>
          <div className="metric-delta warn">대기/진행중</div>
        </div>
        <div className="panel">
          <div className="metric-label">완료</div>
          <div className="metric-value">{summary.done}건</div>
          <div className="metric-delta up">이번 주</div>
        </div>
        <div className="panel">
          <div className="metric-label">보류</div>
          <div className="metric-value">{summary.blocked}건</div>
          <div className="metric-delta down">관리자 확인 필요</div>
        </div>
      </section>

      <section className="tasks-board">
        {tasks.length ? (
          tasks.map((task) => (
            <article className="panel task-card" key={task.id}>
              <div className="task-card-head">
                <div>
                  <div className="task-badges">
                    <span className={`status ${statusClassNames[task.status]}`}>{statusLabels[task.status]}</span>
                    <span className="pill">{task.priority === 'high' ? '높음' : task.priority === 'low' ? '낮음' : '보통'}</span>
                    {task.due_date ? <span className="pill">{new Date(task.due_date).toLocaleDateString('ko-KR')}</span> : null}
                  </div>
                  <h2>{task.title}</h2>
                </div>
                <select
                  aria-label={`${task.title} 상태`}
                  value={task.status}
                  onChange={(event) => updateTask(task, event.target.value as TaskStatus)}
                >
                  <option value="todo">대기</option>
                  <option value="in_progress">진행중</option>
                  <option value="done">완료</option>
                  <option value="blocked">보류</option>
                </select>
              </div>
              <p>{task.description}</p>
              {task.ai_reason ? <div className="insight">{task.ai_reason}</div> : null}
              <label className="task-note">
                완료/진행 메모
                <textarea
                  value={notes[task.id] || ''}
                  onChange={(event) => setNotes((items) => ({ ...items, [task.id]: event.target.value }))}
                  placeholder="실행 내용, 결과, 막힌 이유를 남기세요."
                />
              </label>
              <div className="form-actions">
                <button className="btn primary" type="button" onClick={() => updateTask(task, task.status)}>
                  메모 저장
                </button>
              </div>
            </article>
          ))
        ) : (
          <section className="panel empty-panel">
            <h2>{isLoading ? '업무를 불러오는 중입니다.' : '배정된 업무가 없습니다.'}</h2>
            <p>관리자가 업무를 배정하면 이 화면에서 상태와 메모를 체크할 수 있습니다.</p>
          </section>
        )}
      </section>

      {status ? <p className="save-status admin-status">{status}</p> : null}
    </main>
  );
}
