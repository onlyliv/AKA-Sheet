# iOS 설치형 웹앱의 상단 흐림

## 재현 정보

사용자: iOS 27.2, iOS Chrome에서 설치형 웹앱으로 실행하면 발생. Chrome에서 URL을 직접 열면 발생하지 않음. 1.2.1 / 1.7.1-beta.1의 safe-area 여백·불투명 배경 수정 이후에도 재현됨. 단순 여백 누락이 유일 원인이라는 초기 가설은 충분하지 않음.

## 이번 변경

설치형 WebKit 화면에만 빈 상단 고정 요소를 제공한다. 기본 display:none, display-mode:standalone 및 -webkit-touch-callout/background-clip:text 지원 환경에서만 활성화한다. 높이 11px, 화면 전체 너비, body 색상 상속. 빈 텍스트로 배경을 자르므로 실제 띠가 그려지지 않으며 pointer-events:none으로 터치를 막지 않는다. 추가 여백·스크롤·타이머·저장소 변경 없음. startup 화면 전부터 body의 독립된 자식으로 유지된다.

## 근거와 한계

- 유사 증상의 실제 수정 및 iOS 27 시뮬레이터 결과: https://github.com/HKUDS/nanobot/pull/5942
- WebKit의 상단 고정 요소 색상 검사 구현: https://github.com/WebKit/WebKit/blob/d620932d8ce37cf83f60d5c50dace2d50fed4f80/Source/WebCore/page/LocalFrameView.cpp#L2088

Apple이 보장하는 상태 표시줄 API가 아닌 호환성 우회다. 다른 앱의 성공은 이 앱의 사용자 기기에서 성공했다는 증거가 아니다. 데스크톱 검사로 iOS 합성 효과 해소를 검증했다고 주장하지 않는다.

## 확인

자동 회귀 검사와 일반 브라우저의 레이아웃 비간섭 검사를 진행한다. 사용자 iOS 27.2 설치형 웹앱에서 완전히 종료/재실행 후 새 버전을 확인하고 상단 버튼 선명도, 메뉴 전환, 키보드 표시/회전 뒤에도 효과가 유지되는지 재확인해야 한다. Chrome 일반 탭에서는 요소가 비활성이어야 한다. 사이트 데이터 삭제나 재설치 없이 확인한다.

실행 결과: 두 브랜치 기존 회귀 검사 총 94개 통과. 일반 Chrome에서 보조 요소 display:none, 자식 노드 없음, aria-hidden:true 확인. body padding=0, header top=0, 가로 넘침 없음. 설치형 iOS 27.2의 합성 효과 해소는 미검증.
