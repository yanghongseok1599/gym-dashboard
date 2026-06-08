'use client';

import { useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

const dashboardHtml = String.raw`
<div class="app">
    <aside>
      <div class="brand">
        <div class="logo">GD</div>
        <div>
          <strong>GYM Dashboard</strong>
          <span>Fitness Strategy AI</span>
        </div>
      </div>
      <nav>
        <button class="active" data-view="overview">대표 대시보드</button>
        <button data-view="sales">매출 분석</button>
        <button data-view="members">회원/재등록</button>
        <button data-view="competitors">경쟁사 분석</button>
        <button data-view="staff">직원 업무관리</button>
        <button data-view="report">AI 전략 리포트</button>
      </nav>
      <div class="side-note">
        업로드된 1년치 매출자료를 기준으로 순매출, 재등록, 미수금, 담당자 성과와 경쟁사 대응 전략을 한 화면에 정리합니다.
      </div>
    </aside>

    <main>
      <header>
        <div>
          <h1 id="page-title">대표 대시보드</h1>
          <p class="subtitle" id="page-subtitle">2026년 5월 매출자료 기준 · ITN FITNESS 샘플 리포트</p>
        </div>
        <div class="actions">
          <a class="btn" href="/tasks">내 업무</a>
          <a class="btn" href="/mypage">마이페이지</a>
          <a class="btn" href="/admin" data-admin-link>관리자페이지</a>
          <button class="btn" type="button" id="logout-button">로그아웃</button>
          <button class="btn" data-admin-only>샘플 엑셀</button>
          <button class="btn primary" data-admin-only>매출자료 업로드</button>
        </div>
      </header>

      <div class="view active" data-view-panel="overview">
        <section class="grid cards">
          <div class="panel">
            <div class="metric-label">이번 달 순매출</div>
            <div class="metric-value">₩42,800,000</div>
            <div class="metric-delta up">전월 대비 +12.4%</div>
          </div>
          <div class="panel">
            <div class="metric-label">재등록률</div>
            <div class="metric-value">38.6%</div>
            <div class="metric-delta down">목표 대비 -6.4%p</div>
          </div>
          <div class="panel">
            <div class="metric-label">미수금</div>
            <div class="metric-value">₩3,200,000</div>
            <div class="metric-delta warn">주의 회원 14명</div>
          </div>
          <div class="panel">
            <div class="metric-label">환불률</div>
            <div class="metric-value">4.8%</div>
            <div class="metric-delta up">전월 대비 -1.1%p</div>
          </div>
        </section>

        <section class="grid main-layout">
        <div class="grid">
          <div class="panel">
            <div class="section-title">
              <h2>월별 순매출 흐름</h2>
              <span class="pill">최근 12개월</span>
            </div>
            <div class="chart" aria-label="월별 순매출 막대 그래프">
              <div class="bar-wrap"><div class="bar" style="height:52%"></div><span>6월</span></div>
              <div class="bar-wrap"><div class="bar" style="height:58%"></div><span>7월</span></div>
              <div class="bar-wrap"><div class="bar" style="height:61%"></div><span>8월</span></div>
              <div class="bar-wrap"><div class="bar" style="height:48%"></div><span>9월</span></div>
              <div class="bar-wrap"><div class="bar" style="height:57%"></div><span>10월</span></div>
              <div class="bar-wrap"><div class="bar" style="height:66%"></div><span>11월</span></div>
              <div class="bar-wrap"><div class="bar" style="height:72%"></div><span>12월</span></div>
              <div class="bar-wrap"><div class="bar" style="height:64%"></div><span>1월</span></div>
              <div class="bar-wrap"><div class="bar" style="height:69%"></div><span>2월</span></div>
              <div class="bar-wrap"><div class="bar" style="height:73%"></div><span>3월</span></div>
              <div class="bar-wrap"><div class="bar" style="height:70%"></div><span>4월</span></div>
              <div class="bar-wrap"><div class="bar" style="height:84%"></div><span>5월</span></div>
            </div>
          </div>

          <div class="grid two-col">
            <div class="panel">
              <div class="section-title">
                <h2>담당자 성과</h2>
                <span class="pill">순매출 기준</span>
              </div>
              <table>
                <thead>
                  <tr><th>담당자</th><th>순매출</th><th>재등록</th><th>상태</th></tr>
                </thead>
                <tbody>
                  <tr><td>김실장</td><td>₩15,400,000</td><td>47%</td><td><span class="status good">강점</span></td></tr>
                  <tr><td>박트레이너</td><td>₩10,200,000</td><td>41%</td><td><span class="status good">안정</span></td></tr>
                  <tr><td>이상담</td><td>₩8,700,000</td><td>29%</td><td><span class="status mid">관리</span></td></tr>
                  <tr><td>최코치</td><td>₩5,100,000</td><td>23%</td><td><span class="status bad">개선</span></td></tr>
                </tbody>
              </table>
            </div>

            <div class="panel">
              <div class="section-title">
                <h2>AI 핵심 진단</h2>
                <span class="pill">이번 주</span>
              </div>
              <div class="insight">
                신규 매출은 회복됐지만 재등록률이 목표보다 낮습니다. 만료 30일 이내 회원 43명 중 출석률이 높은 18명을 우선 연락 대상으로 잡고, 관계형 직원에게 재등록 상담을 배정하는 것이 좋습니다.
              </div>
            </div>
          </div>
        </div>

        <div class="grid">
          <div class="panel">
            <div class="section-title">
              <h2>오늘 해야 할 대응</h2>
              <span class="pill">우선순위 4개</span>
            </div>
            <div class="task-list">
              <div class="task">
                <strong>만료 예정 회원 재등록 연락</strong>
                <p>30일 이내 만료 예정 43명 중 고가능성 18명을 먼저 상담 예약으로 전환합니다.</p>
                <div class="task-meta"><span class="status good">담당: 김실장</span><span class="status mid">오늘</span></div>
              </div>
              <div class="task">
                <strong>미수금 회수 일정 확정</strong>
                <p>미수금 ₩3,200,000 중 70%가 2개 상품에 집중되어 결제 안내 문구를 표준화합니다.</p>
                <div class="task-meta"><span class="status good">담당: 이상담</span><span class="status mid">48시간</span></div>
              </div>
              <div class="task">
                <strong>경쟁 센터 리뷰 대응 콘텐츠</strong>
                <p>주변 경쟁사 불만 키워드가 혼잡, 상담강요에 집중되어 예약제와 강요 없는 상담을 강조합니다.</p>
                <div class="task-meta"><span class="status good">담당: 최코치</span><span class="status mid">이번 주</span></div>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="section-title">
              <h2>경쟁사 요약</h2>
              <span class="pill">동해시 주요 5곳</span>
            </div>
            <div class="competitor">
              <div><strong>트리트라움피트니스</strong><p>프리미엄 머신 · 24시간 · AI 코칭 · 이벤트 강세</p></div>
              <div class="score">92</div>
            </div>
            <div class="competitor">
              <div><strong>엘루나짐 천곡점</strong><p>동해헬스장/동해PT 키워드 노출 강세</p></div>
              <div class="score">81</div>
            </div>
            <div class="competitor">
              <div><strong>디엠휘트니스 대동점</strong><p>일일권 · 일반 헬스 접근성 · 지역 키워드 선명</p></div>
              <div class="score">74</div>
            </div>
            <div class="competitor">
              <div><strong>엘루나짐 대동점</strong><p>다지점 브랜드 · 공용 인스타그램 활용</p></div>
              <div class="score">70</div>
            </div>
            <div class="competitor">
              <div><strong>팀터틀랫 강원동해점</strong><p>공식 블로그 · 개인 브랜딩형 채널</p></div>
              <div class="score">63</div>
            </div>
          </div>

          <div class="panel">
            <div class="section-title">
              <h2>직원 배치 추천</h2>
              <span class="pill">성향 기반</span>
            </div>
            <div class="tabs">
              <button class="tab active">관계형</button>
              <button class="tab">세일즈형</button>
              <button class="tab">분석형</button>
            </div>
            <div class="insight">
              김실장은 장기회원 재등록, 박트레이너는 신규 PT 전환, 이상담은 미수금/만료 리스트 관리, 최코치는 리뷰 콘텐츠와 회원 운동 리포트 제작에 배치하는 구성이 적합합니다.
            </div>
          </div>

          <div class="panel">
            <div class="section-title">
              <h2>경쟁 대응 업무</h2>
              <span class="pill">4주 실행</span>
            </div>
            <div class="task-list">
              <div class="task">
                <strong>트리트라움 대응</strong>
                <p>대형 시설과 24시간 운영 대신, 체형평가·재활학 기반 PT 콘텐츠로 “방치되지 않는 전문 관리”를 강조합니다.</p>
                <div class="task-meta"><span class="status good">대표/강사진</span><span class="status mid">릴스 4개</span></div>
              </div>
              <div class="task">
                <strong>DM휘트니스 대응</strong>
                <p>저가·일일권과 정면 경쟁하지 않고, 가격보다 자세교정과 결과가 필요한 고객을 상담 질문으로 분리합니다.</p>
                <div class="task-meta"><span class="status good">상담 담당</span><span class="status mid">스크립트 수정</span></div>
              </div>
              <div class="task">
                <strong>엘루나짐 대응</strong>
                <p>동해PT 넓은 키워드보다 동해 재활PT, 동해 체형교정, 산전산후, 척추측만, 키즈PT 세부 키워드를 선점합니다.</p>
                <div class="task-meta"><span class="status good">콘텐츠 담당</span><span class="status mid">블로그 10개</span></div>
              </div>
            </div>
          </div>
        </div>
        </section>
      </div>

      <div class="view" data-view-panel="sales">
        <section class="grid cards">
          <div class="panel"><div class="metric-label">PT 매출</div><div class="metric-value">₩31,600,000</div><div class="metric-delta up">전체의 73.8%</div></div>
          <div class="panel"><div class="metric-label">필라테스 PT</div><div class="metric-value">₩6,700,000</div><div class="metric-delta up">전월 대비 +8.1%</div></div>
          <div class="panel"><div class="metric-label">스페셜 PT</div><div class="metric-value">₩4,500,000</div><div class="metric-delta warn">체험 전환 필요</div></div>
          <div class="panel"><div class="metric-label">평균 객단가</div><div class="metric-value">₩842,000</div><div class="metric-delta up">전월 대비 +5.6%</div></div>
        </section>
        <section class="grid two-col">
          <div class="panel">
            <div class="section-title"><h2>상품별 매출 진단</h2><span class="pill">전략 포인트</span></div>
            <table>
              <thead><tr><th>상품</th><th>매출</th><th>비중</th><th>판단</th></tr></thead>
              <tbody>
                <tr><td>트레이닝 PT</td><td>₩22,400,000</td><td>52%</td><td><span class="status good">주력</span></td></tr>
                <tr><td>체형교정 PT</td><td>₩9,200,000</td><td>22%</td><td><span class="status good">확대</span></td></tr>
                <tr><td>필라테스 PT</td><td>₩6,700,000</td><td>16%</td><td><span class="status mid">콘텐츠 필요</span></td></tr>
                <tr><td>키즈/특수 PT</td><td>₩4,500,000</td><td>10%</td><td><span class="status mid">타깃 선별</span></td></tr>
              </tbody>
            </table>
          </div>
          <div class="panel">
            <div class="section-title"><h2>매출 대응 전략</h2><span class="pill">이번 달</span></div>
            <div class="task-list">
              <div class="task"><strong>체형교정 PT 업셀링</strong><p>트레이닝 PT 회원 중 통증/자세 고민이 있는 회원에게 체형평가 리포트를 제공하고 체형교정 패키지로 전환합니다.</p></div>
              <div class="task"><strong>스페셜 PT 체험권</strong><p>산전산후·완경기·키즈 PT는 무료 상담보다 1회 평가형 체험권이 전환에 유리합니다.</p></div>
              <div class="task"><strong>할인보다 결과 증거</strong><p>DM휘트니스 가격 경쟁을 피하고 Before/After, 평가표, 담당 강사 전문성으로 설득합니다.</p></div>
            </div>
          </div>
        </section>
      </div>

      <div class="view" data-view-panel="members">
        <section class="grid cards">
          <div class="panel"><div class="metric-label">만료 30일 이내</div><div class="metric-value">43명</div><div class="metric-delta warn">우선 연락 18명</div></div>
          <div class="panel"><div class="metric-label">재등록 고가능성</div><div class="metric-value">18명</div><div class="metric-delta up">출석률 70% 이상</div></div>
          <div class="panel"><div class="metric-label">휴면 위험</div><div class="metric-value">27명</div><div class="metric-delta down">최근 21일 미출석</div></div>
          <div class="panel"><div class="metric-label">VIP 후보</div><div class="metric-value">12명</div><div class="metric-delta up">누적 300만원 이상</div></div>
        </section>
        <section class="grid two-col">
          <div class="panel">
            <div class="section-title"><h2>재등록 우선순위</h2><span class="pill">회원 세그먼트</span></div>
            <table>
              <thead><tr><th>그룹</th><th>인원</th><th>액션</th><th>담당</th></tr></thead>
              <tbody>
                <tr><td>고출석 만료 예정</td><td>18명</td><td>운동 리포트+재등록 제안</td><td>김실장</td></tr>
                <tr><td>통증 개선 경험</td><td>9명</td><td>체형 재평가 예약</td><td>박트레이너</td></tr>
                <tr><td>미출석 위험</td><td>27명</td><td>복귀 상담 메시지</td><td>이상담</td></tr>
                <tr><td>키즈/가족권 후보</td><td>6명</td><td>부모 상담 제안</td><td>최코치</td></tr>
              </tbody>
            </table>
          </div>
          <div class="panel">
            <div class="section-title"><h2>회원관리 스크립트</h2><span class="pill">전환 질문</span></div>
            <div class="task-list">
              <div class="task"><strong>재등록 질문</strong><p>“처음 오셨을 때 가장 불편했던 몸 상태가 지금 얼마나 좋아졌는지 같이 확인해볼까요?”</p></div>
              <div class="task"><strong>휴면 복귀 질문</strong><p>“최근 운동이 끊긴 이유가 시간 문제인지, 몸 상태 문제인지 먼저 확인해드리겠습니다.”</p></div>
              <div class="task"><strong>VIP 제안</strong><p>“다음 단계는 단순 운동량 증가보다 체형/통증 재평가 후 목표를 다시 잡는 것이 좋습니다.”</p></div>
            </div>
          </div>
        </section>
      </div>

      <div class="view" data-view-panel="competitors">
        <section class="grid cards">
          <div class="panel"><div class="metric-label">최대 위협</div><div class="metric-value">트리트라움</div><div class="metric-delta warn">대형시설·24시간·프리미엄 머신</div></div>
          <div class="panel"><div class="metric-label">검색 점유 위협</div><div class="metric-value">엘루나짐</div><div class="metric-delta warn">동해헬스장·동해PT 콘텐츠 반복</div></div>
          <div class="panel"><div class="metric-label">가격/접근성 위협</div><div class="metric-value">DM</div><div class="metric-delta down">일일권·이벤트·긴 운영시간</div></div>
          <div class="panel"><div class="metric-label">ITN 우선 전략</div><div class="metric-value">전문 PT</div><div class="metric-delta up">재활·체형교정·특수목적 고객 선점</div></div>
        </section>

        <section class="grid two-col">
          <div class="panel">
            <div class="section-title"><h2>경쟁 구도 핵심 판단</h2><span class="pill">대표 의사결정</span></div>
            <table>
              <thead><tr><th>구도</th><th>경쟁사 움직임</th><th>ITN이 피해야 할 선택</th><th>ITN이 잡아야 할 포지션</th></tr></thead>
              <tbody>
                <tr><td>시설 경쟁</td><td>트리트라움이 대형 규모, 프리미엄 머신, 24시간 운영으로 첫인상 우위</td><td>기구 수, 규모, 가격으로 정면 경쟁</td><td>“몸 상태를 평가하고 끝까지 관리하는 전문 PT 센터”</td></tr>
                <tr><td>검색 경쟁</td><td>엘루나짐이 동해헬스장/동해PT 키워드형 블로그와 인스타 노출을 반복</td><td>일반 운동정보만 따라 쓰기</td><td>동해 재활PT, 체형교정, 산전산후, 완경기, 키즈PT 세부 키워드 선점</td></tr>
                <tr><td>가격 경쟁</td><td>DM이 일일권, 이벤트, 접근성으로 가벼운 유입을 흡수</td><td>할인 경쟁, 무료 상담 남발</td><td>평가형 체험권과 결과 리포트로 고관여 고객만 선별</td></tr>
                <tr><td>브랜딩 경쟁</td><td>팀터틀랫/엘루나는 운영자·트레이너 개인 채널을 활용</td><td>센터 공지 위주의 무개성 콘텐츠</td><td>대표·강사진별 전문 분야와 케이스를 분리 노출</td></tr>
              </tbody>
            </table>
          </div>
          <div class="panel">
            <div class="section-title"><h2>ITN 즉시 대응 방향</h2><span class="pill">이번 주</span></div>
            <div class="task-list">
              <div class="task"><strong>플레이스 첫 문장 교체</strong><p>“동해 재활·체형교정 PT 전문, 재활학 박사과정 대표와 체육학 석사 강사진이 직접 평가·수업하는 ITN피트니스”로 시작합니다.</p></div>
              <div class="task"><strong>상담 유입 분류 질문 추가</strong><p>상담 첫 3분 안에 “대형센터 경험”, “저가 헬스장 경험”, “통증/자세 고민”, “PT 실패 경험”을 체크해 경쟁사별 이탈 원인을 분류합니다.</p></div>
              <div class="task"><strong>콘텐츠 담당 업무 재배치</strong><p>대표는 전문성 릴스, 강사진은 케이스형 블로그, 상담 담당은 후기/리뷰 요청을 맡아 채널별 빈 구간을 메웁니다.</p></div>
            </div>
          </div>
        </section>

        <section class="grid competitor-deep">
          <div class="panel competitor-card">
            <div class="competitor-head">
              <div>
                <h3>트리트라움피트니스</h3>
                <p>가장 강한 시설형 경쟁자. 넓은 규모, 24시간, 프리미엄 머신, AI 코칭 이미지로 “좋은 헬스장” 첫인상을 선점합니다.</p>
              </div>
              <div class="score-large high">92</div>
            </div>
            <div class="evidence-grid">
              <div class="evidence"><strong>플레이스/검색</strong><p>대형 시설, 운영시간, 장비 스펙, 주차 편의가 검색 고객의 첫 비교 기준이 됩니다.</p></div>
              <div class="evidence"><strong>블로그</strong><p>제공된 블로그는 피트니스 전문 콘텐츠보다 일반 리뷰 성격이 강해 깊은 전문성 노출은 약합니다.</p></div>
              <div class="evidence"><strong>인스타그램</strong><p>라비아 피트니스 채널은 1:1 PT 전문 스튜디오 톤으로, 대형 시설과 PT 전문 이미지를 동시에 보완합니다.</p></div>
            </div>
            <div class="strategy-box"><strong>ITN 대응 전략</strong><p>트리트라움과 시설 규모로 싸우지 말고 “대형센터에서 방치된 고객”, “기구는 많은데 내 몸에 맞는 운동을 못 찾은 고객”을 겨냥합니다. 상담 문구는 ‘기구 추천’이 아니라 ‘체형평가 후 운동 처방’으로 잡아야 합니다.</p></div>
            <ul class="compact-list">
              <li>블로그: 동해 대형 헬스장 다니다가 통증이 반복될 때 확인할 5가지</li>
              <li>릴스: 30초 체형평가, 스쿼트가 안 되는 이유, 어깨통증 운동 전 체크</li>
              <li>담당: 대표/박트레이너가 평가 장면 콘텐츠, 김실장이 대형센터 경험 고객 상담</li>
            </ul>
          </div>

          <div class="panel competitor-card">
            <div class="competitor-head">
              <div>
                <h3>엘루나짐 천곡점</h3>
                <p>검색형 콘텐츠 경쟁자. 동해헬스장, 동해헬스, 동해PT 같은 넓은 키워드와 운동정보 콘텐츠로 노출을 확보합니다.</p>
              </div>
              <div class="score-large mid">81</div>
            </div>
            <div class="evidence-grid">
              <div class="evidence"><strong>플레이스/검색</strong><p>천곡 생활권 고객에게 접근성이 좋고, 일반 헬스/PT 탐색 고객을 먼저 흡수할 가능성이 큽니다.</p></div>
              <div class="evidence"><strong>블로그</strong><p>근육, 몸 틀어짐, 통증, 건강비법 등 검색 수요가 있는 질문형 주제를 꾸준히 다룹니다.</p></div>
              <div class="evidence"><strong>인스타그램</strong><p>동해헬스장/동해PT 해시태그로 지역 키워드를 반복해 초보 탐색 고객에게 익숙함을 만듭니다.</p></div>
            </div>
            <div class="strategy-box"><strong>ITN 대응 전략</strong><p>넓은 키워드 경쟁보다 세부 증상 키워드를 먼저 잡아야 합니다. “동해PT” 하나보다 “동해 체형교정 PT”, “동해 허리통증 운동”, “동해 산전산후 운동”, “동해 키즈 자세교정”처럼 구매 의도가 높은 검색어로 방어선을 만듭니다.</p></div>
            <ul class="compact-list">
              <li>블로그: 증상별 12개 글을 예약하고 제목 첫 단어에 ‘동해’를 넣기</li>
              <li>플레이스: 대표 사진을 시설보다 평가/수업/전문 강사진 중심으로 재배치</li>
              <li>담당: 최코치 블로그 초안, 대표 감수, 이상담 검색 키워드 체크</li>
            </ul>
          </div>

          <div class="panel competitor-card">
            <div class="competitor-head">
              <div>
                <h3>디엠휘트니스 대동점</h3>
                <p>가격·운영시간·이벤트형 경쟁자. 1일권, 저가, 무료 OP, 긴 운영시간으로 가벼운 방문과 가격 민감 고객을 유입합니다.</p>
              </div>
              <div class="score-large mid">74</div>
            </div>
            <div class="evidence-grid">
              <div class="evidence"><strong>플레이스/검색</strong><p>대동점 생활권, 긴 운영시간, 저렴한 체험 접근성은 “일단 가볼 곳”으로 강합니다.</p></div>
              <div class="evidence"><strong>블로그</strong><p>BIG EVENT, 신년 이벤트, 무료 OP, 할인 안내처럼 프로모션성 소재가 강합니다.</p></div>
              <div class="evidence"><strong>인스타그램</strong><p>공식 계정 톤으로 지점/이벤트/운동 분위기를 전달해 가격 민감층을 흡수합니다.</p></div>
            </div>
            <div class="strategy-box"><strong>ITN 대응 전략</strong><p>할인으로 맞대응하면 ITN의 전문성 가격이 무너집니다. 대신 ‘무료 상담’보다 ‘유료 또는 보증금 있는 평가형 체험권’을 만들고, 체험 후 평가표를 제공해 PT 전환 명분을 만듭니다.</p></div>
            <ul class="compact-list">
              <li>상품: 1회 체형평가+운동처방 리포트, 결제 시 체험비 차감</li>
              <li>상담: “저렴한 이용권이 필요한지, 몸 문제를 해결할 관리가 필요한지” 분리 질문</li>
              <li>담당: 이상담 가격 민감 고객 분류, 김실장 고관여 고객 재상담</li>
            </ul>
          </div>

          <div class="panel competitor-card">
            <div class="competitor-head">
              <div>
                <h3>엘루나짐 대동점</h3>
                <p>다지점 브랜드와 건강정보형 콘텐츠 경쟁자. 천곡점과 같은 인스타그램을 쓰며 브랜드 반복 노출을 만듭니다.</p>
              </div>
              <div class="score-large mid">70</div>
            </div>
            <div class="evidence-grid">
              <div class="evidence"><strong>플레이스/검색</strong><p>대동 생활권에서 DM과 함께 접근성 비교 대상이 됩니다. 다지점 브랜드라는 인식도 장점입니다.</p></div>
              <div class="evidence"><strong>블로그</strong><p>크레아틴, 키, 압박스타킹, 제로음료, 부스터 등 초보자가 검색하는 건강 상식을 넓게 다룹니다.</p></div>
              <div class="evidence"><strong>인스타그램</strong><p>공용 계정으로 천곡/대동 고객에게 같은 브랜드 이미지를 반복합니다.</p></div>
            </div>
            <div class="strategy-box"><strong>ITN 대응 전략</strong><p>건강상식 콘텐츠를 따라가기보다 “ITN에서 실제로 평가한 케이스” 형식으로 차별화합니다. 정보성 글 끝에는 반드시 ‘내 몸에서는 어떻게 다른가’를 상담 CTA로 연결해야 합니다.</p></div>
            <ul class="compact-list">
              <li>블로그: 정보형 40%, 케이스형 60% 비율로 전환</li>
              <li>인스타: 수업 전 평가표, 회원 동의 후기, 강사 해설을 묶은 캐러셀</li>
              <li>담당: 박트레이너 케이스 설명, 최코치 카드뉴스 제작</li>
            </ul>
          </div>

          <div class="panel competitor-card">
            <div class="competitor-head">
              <div>
                <h3>팀터틀랫 강원동해점</h3>
                <p>본사형 운영 콘텐츠와 개인 브랜딩이 결합된 경쟁자. 연중무휴, 준비물, 단백질, 창업/가맹 등 운영 신뢰감을 만듭니다.</p>
              </div>
              <div class="score-large low">63</div>
            </div>
            <div class="evidence-grid">
              <div class="evidence"><strong>플레이스/검색</strong><p>브랜드형 지점으로 인식될 수 있어 초보 고객에게 안정감을 줍니다.</p></div>
              <div class="evidence"><strong>블로그</strong><p>대청소, 운동복, 단백질, 준비물, 골프/헬스 등 운영과 생활형 콘텐츠가 섞여 있습니다.</p></div>
              <div class="evidence"><strong>인스타그램</strong><p>개인 계정 성격이 강해 담당자 캐릭터가 보이지만, 센터 전문성 메시지는 분산될 수 있습니다.</p></div>
            </div>
            <div class="strategy-box"><strong>ITN 대응 전략</strong><p>ITN도 강사진 개인 브랜딩을 해야 하지만, 단순 일상 노출보다 “전문 분야가 다른 강사진”으로 설계해야 합니다. 대표는 재활/체형, 박트레이너는 PT 전환, 최코치는 리뷰/콘텐츠, 이상담은 관리 시스템을 보여줍니다.</p></div>
            <ul class="compact-list">
              <li>강사진 프로필: 담당 전문 분야, 잘 보는 케이스, 상담 질문 3개 고정</li>
              <li>릴스: 각 강사가 같은 회원 문제를 어떻게 다르게 보는지 비교</li>
              <li>담당: 대표가 기준 수립, 각 직원이 주 1개 전문 콘텐츠 제출</li>
            </ul>
          </div>

          <div class="panel competitor-card">
            <div class="competitor-head">
              <div>
                <h3>ITN 채널 보완 우선순위</h3>
                <p>ITN은 홈페이지 전문성은 강하지만, 플레이스·블로그·인스타에서 같은 메시지가 반복되어야 검색과 상담 전환이 연결됩니다.</p>
              </div>
              <div class="score-large high">긴급</div>
            </div>
            <table>
              <thead><tr><th>채널</th><th>현재 보완점</th><th>이번 주 실행</th><th>담당</th></tr></thead>
              <tbody>
                <tr><td>네이버 플레이스</td><td>전문성 첫인상 부족</td><td>소개문, 대표 사진, 키워드형 소식 3개 수정</td><td>대표+이상담</td></tr>
                <tr><td>블로그</td><td>검색 방어선 부족</td><td>재활PT/체형교정/특수목적 PT 글 10개 예약</td><td>최코치</td></tr>
                <tr><td>인스타그램</td><td>전문 메시지 반복 부족</td><td>평가 장면 릴스 4개, 강사진 캐러셀 3개</td><td>박트레이너</td></tr>
                <tr><td>상담</td><td>경쟁사 경험 분류 부족</td><td>상담지에 경쟁사 경험/가격민감/통증목적 체크 추가</td><td>김실장</td></tr>
              </tbody>
            </table>
            <div class="insight">핵심은 경쟁사를 모두 이기는 것이 아니라, 경쟁사가 약한 “평가·전문성·개별 관리” 구간을 ITN이 압도적으로 선명하게 보여주는 것입니다.</div>
          </div>
        </section>
      </div>

      <div class="view" data-view-panel="staff">
        <section class="grid cards">
          <div class="panel"><div class="metric-label">등록 직원</div><div class="metric-value" id="staff-count">0명</div><div class="metric-delta up" id="staff-count-detail">직원 정보를 입력하세요</div></div>
          <div class="panel"><div class="metric-label">주요 성향</div><div class="metric-value" id="staff-main-type">-</div><div class="metric-delta warn">성향 기반 업무 배분</div></div>
          <div class="panel"><div class="metric-label">이번 주 목표</div><div class="metric-value" id="staff-main-kpi">-</div><div class="metric-delta up">직원별 목표 자동 반영</div></div>
          <div class="panel"><div class="metric-label">운영 메모</div><div class="metric-value" id="staff-main-note">-</div><div class="metric-delta warn">업무 배정 메모 기준</div></div>
        </section>
        <section class="grid two-col">
          <div class="panel">
            <div class="section-title"><h2>근무자 직원 정보 업데이트</h2><span class="pill">직접 수정</span></div>
            <form id="staff-form">
              <input type="hidden" id="staff-id">
              <div class="form-grid">
                <div class="form-field">
                  <label for="staff-name">직원 이름</label>
                  <input id="staff-name" required placeholder="예: 김실장">
                </div>
                <div class="form-field">
                  <label for="staff-role">직무/포지션</label>
                  <input id="staff-role" placeholder="예: 상담 실장, PT 트레이너">
                </div>
                <div class="form-field">
                  <label for="staff-type">성향</label>
                  <select id="staff-type">
                    <option>관계형</option>
                    <option>세일즈형</option>
                    <option>분석형</option>
                    <option>콘텐츠형</option>
                    <option>운영관리형</option>
                  </select>
                </div>
                <div class="form-field">
                  <label for="staff-schedule">근무 가능 시간</label>
                  <input id="staff-schedule" placeholder="예: 평일 10:00-19:00">
                </div>
                <div class="form-field">
                  <label for="staff-strength">강점</label>
                  <input id="staff-strength" placeholder="예: 장기회원 상담, 체형평가, 릴스 출연">
                </div>
                <div class="form-field">
                  <label for="staff-kpi">이번 주 목표</label>
                  <input id="staff-kpi" placeholder="예: 재등록 예약 12건">
                </div>
                <div class="form-field full">
                  <label for="staff-note">업무 배정 메모</label>
                  <textarea id="staff-note" placeholder="예: 대형센터 경험 고객 상담, 만료 30일 회원 재등록 연락, 후기 수집 담당"></textarea>
                </div>
              </div>
              <div class="form-actions">
                <button class="btn primary" type="button" id="staff-save">직원 정보 저장</button>
                <button class="btn" type="button" id="staff-reset">새 직원 입력</button>
                <span class="save-status" id="staff-save-status"></span>
              </div>
            </form>
          </div>
          <div class="panel">
            <div class="section-title"><h2>등록된 직원 정보</h2><span class="pill">수정/삭제 가능</span></div>
            <table>
              <thead><tr><th>직원</th><th>직무</th><th>성향</th><th>강점</th><th>목표</th><th>관리</th></tr></thead>
              <tbody id="staff-table-body"></tbody>
            </table>
          </div>
        </section>
        <section class="grid two-col">
          <div class="panel">
            <div class="section-title"><h2>직원별 업무표</h2><span class="pill">이번 주</span></div>
            <table>
              <thead><tr><th>직원</th><th>주요 업무</th><th>목표</th></tr></thead>
              <tbody id="staff-work-body"></tbody>
            </table>
          </div>
          <div class="panel">
            <div class="section-title"><h2>운영 체크리스트</h2><span class="pill">매일</span></div>
            <div class="task-list">
              <div class="task"><strong>오전</strong><p>전날 상담/문의/리뷰/미수금 변동 확인 후 담당자별 할 일 배정.</p></div>
              <div class="task"><strong>오후</strong><p>만료 예정 회원 연락 결과와 신규 상담 예약률 점검.</p></div>
              <div class="task"><strong>마감</strong><p>오늘 콘텐츠 소재, 회원 변화 사례, 리뷰 요청 대상을 기록.</p></div>
            </div>
          </div>
        </section>
      </div>

      <div class="view" data-view-panel="report">
        <section class="grid main-layout">
          <div class="panel">
            <div class="section-title"><h2>AI 전략 리포트</h2><span class="pill">요약</span></div>
            <div class="task-list">
              <div class="task"><strong>핵심 문제</strong><p>ITN은 전문성 증거가 강하지만, 경쟁사가 시설·가격·지역 키워드에서 각자 강점을 갖고 있어 채널별 메시지 반복이 필요합니다.</p></div>
              <div class="task"><strong>핵심 전략</strong><p>일반 헬스장 키워드보다 동해 재활PT, 동해 체형교정, 산전산후, 완경기, 키즈PT 세부 키워드를 선점합니다.</p></div>
              <div class="task"><strong>이번 달 목표</strong><p>블로그 30개, 릴스 24개, 리뷰 20건, 체형평가 예약 30건을 만들고 재등록률을 45%까지 회복합니다.</p></div>
            </div>
          </div>
          <div class="grid">
            <div class="panel">
              <div class="section-title"><h2>문서 링크</h2><span class="pill">로컬</span></div>
              <div class="task-list">
                <div class="task"><strong>심층 경쟁사 분석</strong><p>reports/itn_competitor_deep_strategy.md</p></div>
                <div class="task"><strong>채널 분석</strong><p>reports/itn_competitor_channel_analysis.md</p></div>
                <div class="task"><strong>저장 데이터</strong><p>data/itn_competitors.json</p></div>
              </div>
            </div>
            <div class="panel">
              <div class="section-title"><h2>추적 지표</h2><span class="pill">주간</span></div>
              <table>
                <tbody>
                  <tr><td>플레이스 전화/톡톡/길찾기</td><td><span class="status good">상승 추적</span></td></tr>
                  <tr><td>동해 재활PT 검색 노출</td><td><span class="status mid">신규 확보</span></td></tr>
                  <tr><td>릴스 저장/DM 문의</td><td><span class="status good">전환 추적</span></td></tr>
                  <tr><td>재등록률</td><td><span class="status bad">45% 목표</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
`;

type StaffMember = {
  id: string;
  name: string;
  role: string;
  type: string;
  schedule: string;
  strength: string;
  kpi: string;
  note: string;
};

type DbStaffMember = {
  id: string;
  name: string;
  role: string | null;
  personality: string | null;
  working_hours: string | null;
  strengths: string | null;
  weekly_goal: string | null;
  assignment_note: string | null;
};

const pages = {
  overview: {
    title: '대표 대시보드',
    subtitle: '2026년 5월 매출자료 기준 · ITN FITNESS 샘플 리포트',
  },
  sales: {
    title: '매출 분석',
    subtitle: '상품별 매출, 객단가, 할인/환불/미수금 흐름을 분석합니다.',
  },
  members: {
    title: '회원/재등록',
    subtitle: '만료 예정 회원, 휴면 위험 회원, 재등록 우선순위를 정리합니다.',
  },
  competitors: {
    title: '경쟁사 분석',
    subtitle: '동해시 주요 피트니스 경쟁사 5곳과 ITN 대응 전략입니다.',
  },
  staff: {
    title: '직원 업무관리',
    subtitle: '직원 성향과 성과를 기준으로 주간 업무를 배분합니다.',
  },
  report: {
    title: 'AI 전략 리포트',
    subtitle: '매출자료와 경쟁사 분석을 토대로 이번 달 실행 전략을 제시합니다.',
  },
} as const;

const staffStorageKey = 'gymDashboardStaffV2';
const legacyStaffStorageKey = 'gymDashboardStaff';
const storeId = process.env.NEXT_PUBLIC_SUPABASE_STORE_ID || '00000000-0000-4000-8000-000000000001';

const escapeText = (value: string) =>
  String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const loadStaff = (): StaffMember[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(staffStorageKey) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const saveStaff = (staffMembers: StaffMember[]) => {
  try {
    localStorage.setItem(staffStorageKey, JSON.stringify(staffMembers));
    return true;
  } catch {
    return false;
  }
};

const mapDbStaff = (member: DbStaffMember): StaffMember => ({
  id: member.id,
  name: member.name,
  role: member.role || '직무 미입력',
  type: member.personality || '관계형',
  schedule: member.working_hours || '',
  strength: member.strengths || '강점 미입력',
  kpi: member.weekly_goal || '목표 미입력',
  note: member.assignment_note || '업무 메모 미입력',
});

const loadStaffFromSupabase = async () => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('staff_members')
    .select('id,name,role,personality,working_hours,strengths,weekly_goal,assignment_note')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map((member) => mapDbStaff(member as DbStaffMember));
};

const saveStaffToSupabase = async (member: StaffMember) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('staff_members')
    .upsert({
      id: member.id,
      store_id: storeId,
      name: member.name,
      role: member.role,
      personality: member.type,
      working_hours: member.schedule,
      strengths: member.strength,
      weekly_goal: member.kpi,
      assignment_note: member.note,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .select('id,name,role,personality,working_hours,strengths,weekly_goal,assignment_note')
    .single();

  if (error) throw error;
  return mapDbStaff(data as DbStaffMember);
};

const deleteStaffFromSupabase = async (id: string) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('staff_members')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('store_id', storeId);

  if (error) throw error;
};

export default function Dashboard() {
  useEffect(() => {
    const navButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('nav button[data-view]'));
    const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-view-panel]'));
    const pageTitle = document.querySelector<HTMLElement>('#page-title');
    const pageSubtitle = document.querySelector<HTMLElement>('#page-subtitle');
    const logoutButton = document.querySelector<HTMLButtonElement>('#logout-button');
    const adminLink = document.querySelector<HTMLAnchorElement>('[data-admin-link]');
    const adminOnlyElements = Array.from(document.querySelectorAll<HTMLElement>('[data-admin-only]'));
    const staffNavButton = document.querySelector<HTMLButtonElement>('nav button[data-view="staff"]');

    const supabase = getSupabaseClient();

    const bindAccountActions = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('employee_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (adminLink && data?.role !== 'admin') {
        adminLink.style.display = 'none';
      }
      if (data?.role !== 'admin') {
        adminOnlyElements.forEach((element) => {
          element.style.display = 'none';
        });
        if (staffNavButton) staffNavButton.style.display = 'none';
      }
    };

    bindAccountActions();

    logoutButton?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = '/login';
    });

    navButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const view = button.dataset.view as keyof typeof pages;
        if (!view || !pages[view]) return;
        navButtons.forEach((item) => item.classList.toggle('active', item === button));
        panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.viewPanel === view));
        if (pageTitle) pageTitle.textContent = pages[view].title;
        if (pageSubtitle) pageSubtitle.textContent = pages[view].subtitle;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    try {
      localStorage.removeItem(legacyStaffStorageKey);
    } catch {
      // Ignore blocked localStorage.
    }

    const staffForm = document.querySelector<HTMLFormElement>('#staff-form');
    const staffIdInput = document.querySelector<HTMLInputElement>('#staff-id');
    const staffNameInput = document.querySelector<HTMLInputElement>('#staff-name');
    const staffRoleInput = document.querySelector<HTMLInputElement>('#staff-role');
    const staffTypeInput = document.querySelector<HTMLSelectElement>('#staff-type');
    const staffScheduleInput = document.querySelector<HTMLInputElement>('#staff-schedule');
    const staffStrengthInput = document.querySelector<HTMLInputElement>('#staff-strength');
    const staffKpiInput = document.querySelector<HTMLInputElement>('#staff-kpi');
    const staffNoteInput = document.querySelector<HTMLTextAreaElement>('#staff-note');
    const staffTableBody = document.querySelector<HTMLTableSectionElement>('#staff-table-body');
    const staffWorkBody = document.querySelector<HTMLTableSectionElement>('#staff-work-body');
    const staffSaveButton = document.querySelector<HTMLButtonElement>('#staff-save');
    const staffResetButton = document.querySelector<HTMLButtonElement>('#staff-reset');
    const staffSaveStatus = document.querySelector<HTMLElement>('#staff-save-status');
    const staffCount = document.querySelector<HTMLElement>('#staff-count');
    const staffCountDetail = document.querySelector<HTMLElement>('#staff-count-detail');
    const staffMainType = document.querySelector<HTMLElement>('#staff-main-type');
    const staffMainKpi = document.querySelector<HTMLElement>('#staff-main-kpi');
    const staffMainNote = document.querySelector<HTMLElement>('#staff-main-note');

    if (!staffForm || !staffIdInput || !staffNameInput || !staffRoleInput || !staffTypeInput || !staffScheduleInput || !staffStrengthInput || !staffKpiInput || !staffNoteInput || !staffTableBody || !staffWorkBody || !staffSaveButton || !staffResetButton || !staffSaveStatus) return;

    let staffMembers = loadStaff();

    const renderStaff = () => {
      if (staffCount) staffCount.textContent = `${staffMembers.length}명`;
      if (staffCountDetail) staffCountDetail.textContent = staffMembers.length ? 'Supabase 저장 완료' : '직원 정보를 입력하세요';
      if (staffMainType) staffMainType.textContent = staffMembers[0]?.type || '-';
      if (staffMainKpi) staffMainKpi.textContent = staffMembers[0]?.kpi || '-';
      if (staffMainNote) staffMainNote.textContent = staffMembers[0]?.note || '-';

      if (!staffMembers.length) {
        staffTableBody.innerHTML = '<tr><td colspan="6">등록된 직원이 없습니다. 왼쪽 입력창에서 직원 정보를 저장하세요.</td></tr>';
        staffWorkBody.innerHTML = '<tr><td colspan="3">직원 정보를 저장하면 업무표가 자동으로 생성됩니다.</td></tr>';
        return;
      }

      staffTableBody.innerHTML = staffMembers.map((member) => `
        <tr>
          <td><button class="staff-name-button" type="button" data-staff-edit="${member.id}">${escapeText(member.name)}</button></td>
          <td>${escapeText(member.role)}</td>
          <td><span class="status good">${escapeText(member.type)}</span></td>
          <td>${escapeText(member.strength)}</td>
          <td>${escapeText(member.kpi)}</td>
          <td>
            <div class="row-actions">
              <button class="table-action" type="button" data-staff-edit="${member.id}">수정</button>
              <button class="table-action danger" type="button" data-staff-delete="${member.id}">삭제</button>
            </div>
          </td>
        </tr>
      `).join('');

      staffWorkBody.innerHTML = staffMembers.map((member) => `
        <tr>
          <td>${escapeText(member.name)}</td>
          <td>${escapeText(member.note || member.strength)}</td>
          <td>${escapeText(member.kpi)}</td>
        </tr>
      `).join('');
    };

    const clearStaffForm = () => {
      staffForm.reset();
      staffIdInput.value = '';
      staffSaveStatus.textContent = '';
      staffNameInput.focus();
    };

    const editStaff = (id: string) => {
      const member = staffMembers.find((item) => item.id === id);
      if (!member) return;
      staffIdInput.value = member.id;
      staffNameInput.value = member.name;
      staffRoleInput.value = member.role;
      staffTypeInput.value = member.type;
      staffScheduleInput.value = member.schedule;
      staffStrengthInput.value = member.strength;
      staffKpiInput.value = member.kpi;
      staffNoteInput.value = member.note;
      staffSaveStatus.textContent = `${member.name} 정보 수정 중`;
      staffNameInput.focus();
    };

    const refreshStaffFromSupabase = async () => {
      try {
        const remoteStaff = await loadStaffFromSupabase();
        staffMembers = remoteStaff;
        saveStaff(staffMembers);
        renderStaff();
        if (remoteStaff.length) {
          staffSaveStatus.textContent = 'Supabase에서 직원 정보를 불러왔습니다.';
        }
      } catch {
        staffSaveStatus.textContent = 'Supabase 연결 실패로 브라우저 임시 저장 데이터를 표시합니다.';
      }
    };

    const saveStaffFromForm = async () => {
      const name = staffNameInput.value.trim();
      if (!name) {
        staffSaveStatus.textContent = '직원 이름을 입력해야 저장됩니다.';
        staffNameInput.focus();
        return;
      }

      const id = staffIdInput.value || crypto.randomUUID();
      const updated: StaffMember = {
        id,
        name,
        role: staffRoleInput.value.trim() || '직무 미입력',
        type: staffTypeInput.value,
        schedule: staffScheduleInput.value.trim(),
        strength: staffStrengthInput.value.trim() || '강점 미입력',
        kpi: staffKpiInput.value.trim() || '목표 미입력',
        note: staffNoteInput.value.trim() || '업무 메모 미입력',
      };

      staffSaveButton.disabled = true;
      staffSaveStatus.textContent = `${updated.name} 정보를 Supabase에 저장 중입니다.`;

      try {
        const savedMember = await saveStaffToSupabase(updated);
        const existingIndex = staffMembers.findIndex((member) => member.id === savedMember.id);
        if (existingIndex >= 0) {
          staffMembers[existingIndex] = savedMember;
        } else {
          staffMembers.push(savedMember);
        }
        saveStaff(staffMembers);
        renderStaff();
        staffSaveStatus.textContent = `${savedMember.name} 정보가 Supabase에 저장되었습니다.`;
        staffIdInput.value = savedMember.id;
      } catch {
        const existingIndex = staffMembers.findIndex((member) => member.id === id);
        if (existingIndex >= 0) {
          staffMembers[existingIndex] = updated;
        } else {
          staffMembers.push(updated);
        }
        saveStaff(staffMembers);
        renderStaff();
        staffSaveStatus.textContent = `${updated.name} 정보가 화면에는 반영됐지만 Supabase 저장은 실패했습니다.`;
        staffIdInput.value = updated.id;
      } finally {
        staffSaveButton.disabled = false;
      }
    };

    const deleteStaff = async (id: string) => {
      const member = staffMembers.find((item) => item.id === id);
      if (!member) return;
      const shouldDelete = window.confirm(`${member.name} 직원 정보를 삭제할까요?`);
      if (!shouldDelete) return;

      try {
        await deleteStaffFromSupabase(id);
        staffMembers = staffMembers.filter((item) => item.id !== id);
        saveStaff(staffMembers);
        renderStaff();

        if (staffIdInput.value === id) {
          clearStaffForm();
        }

        staffSaveStatus.textContent = `${member.name} 직원 정보가 삭제되었습니다.`;
      } catch {
        staffSaveStatus.textContent = `${member.name} 직원 정보 삭제 중 Supabase 오류가 발생했습니다.`;
      }
    };

    renderStaff();
    refreshStaffFromSupabase();

    staffForm.addEventListener('submit', (event) => {
      event.preventDefault();
      saveStaffFromForm();
    });
    staffSaveButton.addEventListener('click', saveStaffFromForm);
    staffNameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        saveStaffFromForm();
      }
    });
    staffResetButton.addEventListener('click', clearStaffForm);
    staffTableBody.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const editButton = target.closest<HTMLElement>('[data-staff-edit]');
      if (editButton?.dataset.staffEdit) {
        editStaff(editButton.dataset.staffEdit);
        return;
      }

      const deleteButton = target.closest<HTMLElement>('[data-staff-delete]');
      if (deleteButton?.dataset.staffDelete) deleteStaff(deleteButton.dataset.staffDelete);
    });
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: dashboardHtml }} />;
}
