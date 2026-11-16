# Google Drive 베타 배포 관리

- 개발 원본: AKA-Sheet의 beta/google-drive-sync 브랜치.
- 기존 운영 서비스는 main 및 기존 사이트에 유지하며 병합하지 않는다.
- 베타 사이트: https://aka-sheet-drive-beta-7k29.g-flow.chatgpt.site/
- 베타 project_id: appgprj_6afac413d82c8191b8fe1836439b2716. 현재 소유자만 접근 가능하며 다른 기기도 같은 ChatGPT 계정으로 접근한다.
- 사이트 소스 준비 디렉터리: 개발 디렉터리와 나란한 AKA-Sheet-Drive-Beta-Site. 별도 Git 이력으로 Sites 저장소를 관리한다. 개발 브랜치의 검증된 추적 파일을 이 디렉터리로 반영하고 같은 project_id의 소스 helper를 사용해 업로드·패키징한다. 기존 운영 project_id를 사용하지 않는다.
- 최초 업로드는 요청당 64MiB 제한 때문에 6개 누적 소스 커밋으로 전송했으며 최종 파일 트리 동일성을 확인했다. GitHub의 기존 개발 이력은 재작성하지 않았다. 후속 변경은 이 Sites 소스 이력을 이어서 배포한다.
- 인증정보는 도구에서 받은 단기 자격을 숨김 stdin/프로세스 메모리로만 전달하며 파일이나 Git에 보관하지 않는다. 공개 OAuth 클라이언트 ID는 public/drive-config.js에 포함하며 client secret은 사용하지 않는다.
- 로컬 주소와 웹 주소의 사용자 저장소는 별개다. 같은 Google 계정과 프로젝트의 앱 데이터 공간으로 기록을 합치며 모델/사전팩·원본 책은 기기마다 별도로 준비한다.

- 1.3.0-beta.1부터 public/은 정적 원본, server/는 인증 서버, dist/client·dist/server는 생성 결과다. .openai/hosting.json은 static을 제거하고 d1=DB를 선언한다. 패키징 명령에 node scripts/build-server.mjs를 포함한다. 토큰은 암호화된 서버 DB에만 보관하며 환경 비밀값은 소스에 저장하지 않는다.
