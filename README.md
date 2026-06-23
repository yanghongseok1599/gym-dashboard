# GYM Dashboard

ITN 피트니스 내부 운영 대시보드입니다. 매출 분석, 회원/재등록 관리, 경쟁사 분석, 직원 업무관리, 관리자 승인 흐름을 Next.js와 Supabase 기반으로 제공합니다.

## 실행 준비

1. 의존성 설치

```bash
npm install
```

2. 환경변수 파일 생성

```bash
cp .env.example .env.local
```

`.env.local`에 Supabase 프로젝트 값을 입력합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_STORE_ID=
```

3. 개발 서버 실행

```bash
npm run dev
```

4. 배포 전 확인

```bash
npm run build
npm audit --audit-level=moderate
```

## 주요 경로

- `/login`: 직원 로그인, 회원가입, 비밀번호 찾기
- `/reset-password`: 비밀번호 재설정
- `/`: 대시보드
- `/mypage`: 마이페이지
- `/tasks`: 직원 업무
- `/admin`: 관리자 페이지

## 실사용 흐름

1. 관리자는 `/login`에서 로그인합니다.
2. 대시보드 상단의 `샘플 CSV`로 엑셀에서 열 수 있는 입력 양식을 내려받습니다.
3. 1년치 매출자료를 CSV, TSV 또는 XLSX로 저장한 뒤 `매출자료 업로드`로 올립니다.
4. 대시보드는 순매출, 재등록률, 미수금, 환불률, 월별 흐름, 담당자 성과를 즉시 반영하고 `sales_uploads`에 분석 요약을 저장합니다.
5. `/admin`에서 직원 가입 승인과 업무 배정을 하고, 직원은 `/tasks`에서 본인 업무 상태와 메모를 업데이트합니다.

매출자료 필수 헤더는 아래 순서와 이름을 권장합니다.

```text
매출 이름,매출 유형,회원 이름,연락처,결제/환불 수단,판매금액,결제금액/환불금액,미수금여부,결제일/환불일,결제 담당자,재등록 여부
```

운영 배포 주소는 `https://gym-dashboard-beige.vercel.app`입니다.

## Supabase

마이그레이션 파일은 `supabase/migrations`에 있습니다. 새 Supabase 프로젝트에 연결할 때는 Supabase CLI로 프로젝트를 link한 뒤 마이그레이션을 적용합니다.

```bash
supabase link --project-ref your-project-ref
supabase db push
```

관리자 계정은 첫 승인 관리자 또는 DB의 `employee_profiles` 승인 상태로 관리합니다.
