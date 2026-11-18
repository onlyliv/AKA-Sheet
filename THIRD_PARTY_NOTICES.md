# 외부 구성 요소와 데이터 출처

AKA Sheet는 아래 외부 엔진과 데이터를 활용합니다. 앱 자체에는 아직 별도 재사용 라이선스를 지정하지 않았습니다. 외부 코드·모델·데이터에는 각각의 이용 조건이 적용되며, 이 문서는 원문 고지를 대체하지 않습니다.

| 구성 요소 | 사용 범위 | 고지 / 출처 |
|---|---|---|
| PDF.js | PDF 표시와 문자 정보 | Mozilla Foundation · Apache-2.0 · `dist/vendor/pdf*.js`의 원문 고지 |
| JSZip / pako | EPUB·ZIP 압축 처리 | JSZip MIT 또는 GPLv3 이중 라이선스, pako MIT · `dist/vendor/jszip.min.js`의 원문 고지 및 [JSZip 라이선스](https://github.com/Stuk/jszip/blob/main/LICENSE.markdown) |
| Tesseract / 언어 데이터 | OCR 경량·정밀 | [Apache-2.0](licenses/Tesseract-Apache-2.0.txt), [모델 출처](dist/licenses/OCR-model-sources.md) |
| PaddleOCR / 브라우저 SDK | OCR | [Apache-2.0](licenses/PaddleOCR-Apache-2.0.txt), [모델 출처와 브라우저 호환 변경](licenses/PaddleOCR-vendoring.md) |
| ONNX Runtime | 브라우저 추론 | [MIT](licenses/ONNX-Runtime-MIT.txt), [Paddle용 런타임 고지](licenses/Paddle-ONNX-Runtime-MIT.txt) |
| OpenCV.js / js-yaml / Clipper | Paddle 전처리·설정·좌표 | [버전·출처](licenses/PaddleOCR-vendoring.md), Apache-2.0 / MIT / Boost. 원문 고지 유지 |
| Transformers.js | 번역 모델 실행 | [Apache-2.0](licenses/Transformers-Apache-2.0.txt) |
| M2M100 / NLLB | 선택형 번역 | [M2M100 모델 카드](licenses/M2M100-model-card.md), [NLLB 모델 카드](licenses/NLLB-model-card.md). NLLB 가중치는 실험용·비상업 옵션이며 저장소에 포함하지 않음 |
| JMdict | 일영 사전팩 | James William BREEN 및 EDRDG · [이용 조건](https://www.edrdg.org/edrdg/licence.html) · CC BY-SA 4.0 |
| Wiktionary / Kaikki | 한·영·일 사전팩 | Wiktionary 기여자, Kaikki 추출 데이터 · 각 팩의 `upstream`, `edition`, `license`, `licenseUrl` 기록 |

## 가공한 사전 데이터

`dist/dictionaries/`의 사전팩은 원문 전체를 그대로 복제한 형식이 아니라, 앱 검색에 사용하는 표제어·읽는 법·품사·뜻풀이 등을 추출해 JSONL로 정규화하고 gzip으로 압축한 파생 데이터입니다. 일부 팩은 분할 저장합니다. 변환 코드는 `scripts/`에 있습니다.

각 팩의 출처·버전·언어·항목 수·해시는 [catalog.json](dist/dictionaries/catalog.json)과 각 `*.meta.json`에 있습니다. 파생 사전팩은 명시된 CC BY-SA 4.0 조건을 유지하며, [라이선스 전문](dist/dictionaries/LICENSE.txt)을 함께 제공합니다. 앱의 사전 조회 결과에도 원문·기여자 출처 링크를 제공합니다. [CC BY-SA 4.0 조건](https://creativecommons.org/licenses/by-sa/4.0/)은 출처 표시, 변경 사실 표시, 파생 데이터의 동일 조건 공유를 요구합니다.

책 원본은 사용자가 직접 엽니다. 저장소와 소개 화면에는 사용자의 상용 교재를 포함하지 않았으며, README의 이미지는 앱에 직접 제작해 넣은 체험용 학습지입니다.

## Optional Korean spacing correction · Kiwi
Kiwi WASM (`kiwi-nlp` 0.24.1) and the 0.24.0 base CoNg model: Apache-2.0.
Source: https://github.com/bab2min/Kiwi (tag v0.24.1); model release: v0.24.0.
Runtime JS/WASM are unmodified. Model files are losslessly gzip-compressed and split into 8 MiB chunks; optional default/multi/typo/dialect dictionaries are excluded. Models and runtime download only on user request.
License and upstream NOTICE, including NIKL corpus attribution, are distributed under `public/licenses/Kiwi-*`. NOTICE lists Eigen (MPL-2.0), cpp-btree/streamvbyte (Apache-2.0), cpuinfo (BSD-2-Clause), mimalloc and nlohmann/json (MIT). Their license texts accompany the distribution. Upstream source, including unmodified Eigen headers used by the WASM build, is available from https://github.com/bab2min/Kiwi/tree/v0.24.1/third_party .

The optional model chunks are served from the immutable public AKA-Sheet commit 45c88d9d8961dd9a4c3d9947eac1b5143993b523 on raw.githubusercontent.com, only after explicit user enablement. The runtime and license notices remain served by the app.
