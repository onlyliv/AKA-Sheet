# AKA Sheet

책의 색상과 직접 표시한 형광펜을 가리며 공부하는 브라우저 기반 학습 앱입니다. 현재 앱 버전은 **1.0.0**입니다.

- 서비스: [AKA Sheet 열기](https://akai-sheet-beta-local-7k29.g-flow.chatgpt.site/)
- 버전 이력: [dist/releases.js](dist/releases.js)
- 최신 QA: [1.0.0 메뉴 사용자화 검증](docs/QA-1.0.0-2026-11-16.md)

## 기능

- PDF, DRM 없는 EPUB, 이미지 및 이미지 ZIP/폴더 읽기
- 색상별 학습 시트, 형광펜, 텍스트·그리기 메모와 탐색기
- 텍스트 추출과 PaddleOCR/Tesseract, 기기 내 번역, 선택 설치형 사전
- 여러 단어장, Notion용 표 복사·CSV 내보내기
- 메뉴 순서·표시·접힘 설정, PC/모바일 메뉴 전체 숨김
- 사용자 데이터 수동 백업·불러오기, 지원 브라우저의 선택 폴더 자동 저장

책 원본과 인식·번역은 기기 안에서 처리합니다. 최초 앱/모델/사전 준비에는 인터넷이 필요합니다. 준비된 파일은 브라우저 저장소를 활용해 오프라인으로 사용하며, 지원 기기와 검증 한계는 QA 문서를 확인하세요.

## 로컬 실행

이 저장소는 빌드 과정이 없는 HTML/CSS/JavaScript 앱입니다. 저장소를 받은 뒤 프로젝트 폴더에서 실행합니다.

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

브라우저에서 `http://127.0.0.1:8765/`를 엽니다. 파일을 직접 더블 클릭하는 `file://` 방식 대신 HTTP 서버를 사용하세요. 사이트 주소·브라우저·포트가 바뀌면 별도 저장소로 취급되므로 필요한 사용자 데이터는 백업 파일로 옮깁니다.

## 폴더 구성

| 경로 | 내용 |
|---|---|
| `dist/` | 실제 배포되는 앱 및 로컬 실행 파일 |
| `tests/` | 기능·저장·오프라인 회귀 검사 |
| `docs/` | QA 결과와 검증 범위 |
| `scripts/` | 사전 데이터 생성·가공 스크립트 |
| `licenses/`, `dist/licenses/` | 외부 구성 요소의 이용 조건 |
| `.openai/hosting.json` | 기존 Sites 배포 대상 설정. 인증 정보는 포함하지 않음 |
| `VERSIONING.md`, `BETA-PLAN.md` | 버전 정책 및 개발 이력 |

## 검사

Node.js와 npm이 설치된 환경에서 프로젝트 폴더에서 실행합니다.

```sh
npm ci --prefix tests --ignore-scripts
for f in tests/*.cjs; do node "$f" || exit 1; done
for f in dist/*.js; do node --check "$f" || exit 1; done
```

사전팩을 변경했을 때는 추가로 `python3 tests/dictionary-packs.py`를 실행합니다. 자동 검사는 실제 모바일/Windows 기기 QA를 대신하지 않습니다.

## Git 및 배포

- `main`: GitHub에서 확인하는 현재 릴리스 소스와 관리 문서
- `beta/local-translation`: 기존 개발 브랜치
- `v1.0.0` 등 버전 태그: 각 앱 릴리스의 소스 경계. 이전 개발 이력을 그대로 보존합니다.
- GitHub는 소스·변경 이력 관리용이며, **서비스 호스팅은 기존 ChatGPT Sites를 유지**합니다. GitHub에 올리는 것만으로 자동 배포되지 않습니다.
- Sites 배포는 `.openai/hosting.json`의 기존 프로젝트를 사용합니다. 별도 안정판 사이트에 임의로 병합하거나 배포하지 않습니다.
- GitHub 원격 이름은 `github`입니다. 기존 `origin` 연결은 보존합니다. 작업 커밋을 만든 뒤 `git push github beta/local-translation`으로 개발 브랜치를 올립니다. 릴리스 태그는 의도적으로 지정해 푸시합니다.

앱 코드와 데이터팩에는 서로 다른 외부 라이선스가 적용됩니다. NLLB는 실험용·비상업 옵션이며 가중치를 자동 다운로드하지 않습니다. 외부 구성 요소의 기존 고지와 사전 출처를 유지하세요. 이 저장소에 앱 자체의 새로운 공개 라이선스를 임의로 부여하지 않았습니다.
