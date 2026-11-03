# PaddleOCR local browser bundle

- PaddleOCR.js 0.4.2 (Apache-2.0); npm dist/index.mjs.
- ONNX Runtime Web 1.31.1 (MIT); ort.wasm.min.mjs + matching threaded WASM loader/binary, one CPU thread.
- OpenCV.js @techstark/opencv-js 4.10.0-release.1 (Apache-2.0), embedded WASM.
- js-yaml 4.3.2 (MIT), clipper-lib 6.4.2 (Boost; copyright/license header retained in clipper.mjs).

The SDK import specifiers are rewritten to local sibling modules. OpenCV's UMD root uses globalThis; clipper and OpenCV expose default ESM exports. Two canvas creation sites in the SDK use OffscreenCanvas when document is unavailable; bitmap conversion uses cv.matFromImageData. These compatibility changes keep inference inside a dedicated worker. Original copyright notices remain in vendored files.

Models: official PP-OCRv5_mobile_det, PP-OCRv5_mobile_rec, korean_PP-OCRv5_mobile_rec ONNX inference archives, downloaded from PaddlePaddle's paddle-model-ecology.bj.bcebos.com/paddlex/official_inference_model/paddle3.0.0/ (names end _onnx_infer.tar). Archives contain inference.onnx and inference.yml and are supplied under PaddleOCR's Apache-2.0 license.

No book image or recognized text is sent to the model download origin. The app serves models and all runtime modules locally from its own origin. First-run preparation caches both OCR engines; translation weights remain explicit downloads. Cache version aka-paddle-024 must be bumped when these runtime/model assets change.
