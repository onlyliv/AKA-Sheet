# 1.2.0-beta.1 · 자동 동기화와 웹 베타 QA

날짜: 2026-11-16. beta/google-drive-sync. 운영 서비스/main 변경 없음.

- sync-policy.cjs: 한 페이지 6회/두 페이지 3회, 지정 이동, 3초/15초 묶음, 변경 시에만 5분 무활동 전송, 실패 시 누적 보존, 제한 재시도, 첫 수동 전송 없이 시작.
- drive-sync-flow.cjs: 독립 로컬 DB 두 기기와 공통 모의 Drive에서 전송·수신·충돌·삭제·오프라인 확인.
- 앱 설정 이벤트는 동기화 트리거에서 제외하고 SyncCore의 기존 전송 화이트리스트를 유지. 페이지 변경 이벤트는 표시 완료 후에만 전달.
- 메뉴 하단 상태 표시 및 클릭 시 데이터 관리 진입. OAuth 공개 식별자만 포함하며 비밀 키·토큰을 포함하지 않음.
- 실제 다른 물리 기기의 상호 동기화·모바일 펜·백그라운드 동작은 사용자의 추가 테스트가 필요. 이전 로컬 베타에서 Google 로그인과 실제 Drive 동기화 성공을 확인한 이력이 있으나, 새 HTTPS origin의 계정 인증·동기화는 별도 검증해야 함.

검증 결과: 기존 검사를 포함한 CJS 44개, 전체 dist 스크립트 구문 및 diff 공백 검사 통과. 별도 localhost 저장소에서 초기 실행, 임베딩된 클라이언트 ID 안내, 메뉴 하단 상태 버튼 → 저장 데이터 관리 바로가기 확인.

## 배포 확인

- 별도 웹 베타: https://aka-sheet-drive-beta-7k29.g-flow.chatgpt.site/
- 사용자 등록 완료 응답으로 새 origin의 Google OAuth 승인 원본 등록 확인.
- 배포 소스: e7d2c6eb3320fb7cfdc8d1fde7d7a90a43fcb405 (Sites 전용 소스 저장소). GitHub 기능 릴리스: cc9cb32. Sites 초기 업로드는 64MiB/요청 제한 때문에 동일 최종 트리를 6개 누적 커밋으로 나눠 전송했다.
- saved version: appgprj_6afac413d82c8191b8fe1836439b2716~appgver_e2860512bab48191a43adcbc95c20fb3
- deployment: appgdep_6afae023986c81918b6ea3397f05b323 · succeeded 확인. 최초 배포 도구 응답 시간 초과 후 상태 조회로 완료 확인했으며 중복 배포하지 않음.
- 실제 Chrome에서 소유자 ChatGPT 로그인 후 1.2.0-beta.1 기동, 메뉴 하단 상태와 설정 바로가기 확인. 새 웹 origin에서는 학습 기록이 비어 있으며 사용자 Google 연결/동기화 전까지 자동 전송하지 않음.
- 공개 클라이언트 ID 포함. 물리 다른 기기 간 왕복 검증은 사용자 시험이 남아 있다.
