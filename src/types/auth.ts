export type EmployeeRole = 'admin' | 'employee';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type EmployeeProfile = {
  id: string;
  store_id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  position: string | null;
  role: EmployeeRole;
  is_active: boolean;
  approval_status: ApprovalStatus;
  approved_at: string | null;
  approved_by: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high';

export type WeeklyTask = {
  id: string;
  store_id: string;
  report_id: string | null;
  staff_id: string | null;
  assignee_profile_id: string | null;
  title: string;
  description: string;
  priority: TaskPriority;
  category: string | null;
  due_date: string | null;
  status: TaskStatus;
  completion_note: string | null;
  ai_reason: string | null;
  created_at: string;
  updated_at: string;
};
