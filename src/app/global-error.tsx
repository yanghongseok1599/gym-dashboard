'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body>
        <main className="auth-shell">
          <section className="auth-card compact">
            <div className="auth-logo">GD</div>
            <h1>페이지를 다시 불러와야 합니다</h1>
            <p>이전 로그인/비밀번호 재설정 기록이 남아 화면을 불러오지 못했습니다. 새로고침하거나 대시보드로 이동하세요.</p>
            <div className="auth-actions-inline">
              <button className="btn primary" type="button" onClick={reset}>
                다시 시도
              </button>
              <button className="btn" type="button" onClick={() => window.location.assign('/')}>
                대시보드
              </button>
              <button className="btn" type="button" onClick={() => window.location.assign('/login')}>
                로그인
              </button>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
