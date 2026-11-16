# 1.1.0-beta.1 · Google Drive 동기화 QA

날짜: 2026-11-16. 별도 브랜치 `beta/google-drive-sync`, 기존 서비스 미배포.

## 자동 검사

- `tests/drive-sync-core.cjs`: 두 기기 동시 수정 수렴, 중복 병합, 수정/삭제 충돌, 오래된 데이터의 삭제 항목 재등장 방지, 단어 중복 삭제, 부모 삭제/자식 편집 복구, 부분 변경 파일의 부모 참조, 체크섬·구조·순환 검증, 실제 IndexedDB 모사를 통한 적용/롤백/중단 복구.
- `tests/drive-client.cjs`: 로그인 요청, 앱 데이터 범위, 목록 페이지 처리, 불변 업로드, 토큰 메모리 보관, no-store·타임아웃·용량 제한·권한/할당량 오류·401 해제. Google API는 모의 응답 사용.
- `tests/drive-sync-flow.cjs`: 두 개의 독립 IndexedDB 기기와 공통 모의 Drive로 컨트롤러의 업로드/다운로드·명시 적용/재실행·오프라인 변경·충돌 복사본·삭제 전파 확인.
- `tests/reading-position-identity.cjs`: 실제 책 열기 함수를 실행해 이전 위치 보완·파일명/수정시각이 다른 동일 파일의 위치 복원·다른 내용의 책 분리를 확인.
- 기존 회귀 검사를 포함한 CJS 42개와 dist JavaScript 구문 검사 통과. 기동 파일 추적 개수와 Service Worker 캐시에 새 로컬 모듈 포함.

## 브라우저

별도 localhost origin에서 베타 앱 초기 실행·1.1.0-beta.1 표시, 설정 → 저장 데이터 관리의 Drive 패널, 미설정/미연결 안내와 동기화 버튼 차단을 확인했습니다. 기존 폴더 저장·백업/불러오기·데이터 요약 UI를 유지합니다.

## 미검증

OAuth 클라이언트 ID 미준비로 실제 Google 로그인/권한·Drive CRUD·계정 전환·실제 두 기기 연동은 실행하지 않았습니다. 모바일·Windows·장기 누적·Google 앱 공개 요구 검증은 남아 있습니다. 설정 안내는 GOOGLE-DRIVE-BETA.md를 참고하세요. 모델 다운로드나 책 내용 외부 전송 정책은 유지하며, Google 동기화는 명시적 사용자 동의 후 학습 기록만 전송합니다.
