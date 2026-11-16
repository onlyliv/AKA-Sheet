# Regression tests

Install the storage-test dependency with `npm ci --prefix tests --ignore-scripts`.
From the repository root, run `for f in tests/*.cjs; do node "$f" || exit 1; done`.
`python3 tests/dictionary-packs.py` validates all dictionary pack hashes and records; run it when packs change.
The storage tests use an isolated in-memory IndexedDB and do not touch browser/user databases.

For UI language changes, regenerate the catalog with `node scripts/build-i18n.mjs dist`, then run `node tests/i18n.cjs` and `node tests/ocr-runtime-cache.cjs`.
