/* Release history is backfilled from the development conversation before 0.9.0. */
const APP_RELEASE={version:'0.13.0-beta.1',history:[
 {version:'0.13.0-beta.1',date:'2026-11-02',kind:'베타 · 기능 추가',changes:['로드맵 1단계: 접이식 학습 시트, 하단 버전·개발 로그, 메뉴 경계 드래그·방향키 크기 조절.','앱 이름 오른쪽에 설정 모달 추가: 메뉴 UI·학습 시트·번역·단축키 탭.','메뉴 시작 펼침, 시트 색상·정답 표시·색상별 감도, 번역 기본값 저장.','정답 전환·누르는 동안 보기·빠른 번역 단축키 지정, 중복·예약 키 검사.','책갈피 단축키는 예약 설정만 저장하며 실제 기능은 3단계에 추가.']},
 {version:'0.12.0-beta.1',date:'2026-11-02',kind:'베타 · 기능 추가',changes:['앱 이름을 AKA Sheet로 변경하고 부제목 삭제.','학습 시트로 이름 변경, 빨강·초록·파랑 글자 숨김 및 색상별 감도 저장.','언어 선택 오른쪽에 상세 설정 배치.','일본어·영어·한국어 원문 및 결과 언어 선택 지원. 같은 언어는 OCR·추출만 실행.','영어·한국어 OCR 경량/정밀 모델과 캐시 관리 추가.']},
 {version:'0.11.0-beta.1',date:'2026-11-02',kind:'베타 · 기능 추가',changes:['숨김 감도 아래 접이식 빠른 번역 패널 추가.','영역 선택 후 OCR+번역 자동 실행, 이전 결과 유지, 전체 복사·크게 보기.','브라우저 내장 번역을 지원할 때 기본 선택하고 사용자 엔진 설정 저장.','모델별 캐시 조회·삭제와 저장소 관리 안내 추가. 책·학습 위치·설정은 유지.','설명은 호버·포커스·탭 가능한 ? 도움말로 이동.','OCR 줄바꿈 정리와 문장 분할, 출력 한도 시 분할 재시도·경고 추가.']},
 {version:'0.10.1-beta.1',date:'2026-11-02',kind:'베타 · 버그 픽스',changes:['배포 서버에서 존재하지 않는 로컬 모델 경로를 조회하지 않도록 수정.','오류·완료 후 늦게 도착한 모델 진행 알림이 상태를 덮어쓰지 않도록 수정.','모델 준비·번역 계산 단계를 구분하고 경과 시간·시간 제한 추가.','빈 번역 결과 및 Worker 오류를 표시하고 재시도할 때 엔진을 재생성.']},
 {version:'0.10.0-beta.1',date:'2026-11-02',kind:'베타 · 기능 실험',changes:['안정판 0.9.0과 분리된 beta/local-translation 브랜치.','선택 영역 OCR·일본어 원문 수정·한국어 로컬 번역 실험.','Tesseract 경량/정밀 설정과 M2M100 엔진 선택.','NLLB는 실험용·비상업으로 분리하고 추후 삭제 검토.','번역 모델은 최초 다운로드 허용 후 기기에서 실행.','품질·iPhone 실행·오프라인 지속성 검증 전이며 안정판에 병합하지 않음.']},
 {version:'0.9.0',date:'2026-11-02',kind:'기능 추가',changes:['메뉴에 개발 로그와 현재 버전 표시 추가.','메이저·마이너·버그 픽스 기준을 문서화.','한 페이지 보기에서도 책 방향 선택과 클릭·스와이프 방향 적용.']},
 {version:'0.8.0',date:'2026-11-02',kind:'기능 추가',changes:['책 화면 좌우 50% 영역 클릭·탭으로 이전·다음 페이지 이동.','책 방향에 따른 클릭·탭 이동 반전.','EPUB의 보안 격리를 유지하는 투명 입력 영역 적용.','드래그·스크롤·스와이프 후 중복 클릭 방지.']},
 {version:'0.7.1',date:'2026-11-02',kind:'버그 픽스',changes:['PC 연속 휠 입력이 멈출 때까지 무시되던 문제 수정.','로딩 중 입력 이후 스크롤 무응답 수정.','작은 휠 입력 누적과 방향 반동 처리 개선.']},
 {version:'0.7.0',date:'2026-11-02',kind:'기능 추가 · 수정',changes:['손가락 좌우 스와이프로 페이지 넘기기 추가.','책 방향과 상관없이 아래 스크롤은 다음, 위 스크롤은 이전으로 이동하도록 수정.','스크롤 관성에 의한 즉시 역방향 이동 방지.']},
 {version:'0.6.0',date:'2026-11-02',kind:'기능 추가',changes:['두 페이지 보기에서 좌→우·우→좌 책 방향 선택 추가.','EPUB·PDF 페이지 배치에 적용하고 선택한 방향 저장.']},
 {version:'0.5.0',date:'2026-11-02',kind:'기능 추가',changes:['앱과 라이브러리를 포함한 오프라인 단일 HTML 배포본 추가.','Mac·Windows용 Python 로컬 실행기 및 사용 안내 제공.']},
 {version:'0.4.0',date:'2026-10-29',kind:'기능 추가',changes:['본문 경계에서 위아래 스크롤로 페이지 이동 추가.','한 페이지·두 페이지 나란히 보기 옵션 추가.','두 페이지 보기에서 한 묶음씩 이동, 홀수 마지막 페이지 처리.']},
 {version:'0.3.0',date:'2026-10-29',kind:'기능 추가',changes:['본문 80%·UI 20% 레이아웃 도입.','큰 제목·설명을 정리하고 본문 너비 제한 제거.','휴대폰 세로 화면에서 UI 위쪽 20%·본문 아래쪽 80% 배치.']},
 {version:'0.2.1',date:'2026-10-29',kind:'버그 픽스',changes:['SVG 내부에 삽입된 페이지 이미지의 빨간 글씨가 숨겨지지 않던 문제 수정.','실제 한자 학습 EPUB으로 숨김·복원 확인.']},
 {version:'0.2.0',date:'2026-10-29',kind:'기능 추가',changes:['DRM 없는 EPUB 불러오기와 본문 단위 이동 지원.','EPUB의 빨간 텍스트·이미지 숨김, 후리가나·세로쓰기 표시 지원.']},
 {version:'0.1.0',date:'2026-10-29',kind:'첫 개발 버전',changes:['iOS·macOS·Windows 브라우저용 학습 앱 제작.','PDF·이미지 열기, 빨간 정답 숨김·복원, 감도 조절.','누르는 동안 정답 보기, 확대·맞춤·페이지 이동.','기기 내 파일 처리, 개인용 웹앱 게시 및 오프라인 캐시 구성.']}
]};
function initializeReleaseLog(){
 document.getElementById('appVersion').textContent='v'+APP_RELEASE.version;
 document.getElementById('releaseCurrent').textContent='현재 버전 '+APP_RELEASE.version;
 const list=document.getElementById('releaseHistory');
 for(const [index,release]of APP_RELEASE.history.entries()){
  const item=document.createElement('details');item.className='release';item.open=index===0;
  const summary=document.createElement('summary');summary.textContent='v'+release.version+' · '+release.date+' · '+release.kind;item.append(summary);
  const ul=document.createElement('ul');for(const change of release.changes){const li=document.createElement('li');li.textContent=change;ul.append(li)}item.append(ul);list.append(item);
 }
 const dialog=document.getElementById('devLog');
 document.getElementById('openDevLog').onclick=()=>dialog.showModal();
 document.getElementById('closeDevLog').onclick=()=>dialog.close();
}
