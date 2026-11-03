/* Runtime OCR may load app code, but never download missing language weights. */
const appFetch=self.fetch.bind(self);
self.fetch=(input,init)=>{const url=new URL(typeof input==='string'?input:input.url,self.location.href);if(/\.traineddata(?:\.gz)?$/i.test(url.pathname))return Promise.reject(Error('MODEL_REQUIRED_OCR: OCR 모델이 없습니다. 모델 관리에서 다운로드하세요.'));return appFetch(input,init)};
importScripts('./vendor/ocr/worker.min.js');
