# AKA Sheet

[한국어](README.md) · English · [日本語](README.ja.md)

An offline-first study reader for PDF, DRM-free EPUB and image books. Hide colored answers, recognize selected text on your device, translate, highlight, take text or drawing notes, look up dictionaries and collect vocabulary.

- [Open the public app](https://akai-sheet-beta-local-7k29.g-flow.chatgpt.site/) · main **1.2.2**
- [Open Drive sync beta](https://aka-sheet-drive-beta-7k29.g-flow.chatgpt.site/) · beta **1.5.0-beta.1**

The public app and the Drive beta are separate deployments and browser storage areas. Google Drive synchronization is available only in the beta.

## Interface languages

Korean, English and Japanese are supported. The first launch follows your system language, with English as the fallback for unsupported languages. Choose **Settings → Menu UI → App display language** to override it. The preference applies on the next launch, so changing it does not interrupt your current work.

UI language is independent of OCR recognition, translation and dictionary target languages. Books, notes, vocabulary meanings and historical release records retain their original content.

## Try it

Open the app and use the built-in sample sheet without uploading a book. Select a color and choose **Hide colors**. Open your own book and use **Select area** for OCR, highlights, notes, translation, dictionary lookup or vocabulary.

Original books stay on your device. OCR and translation run locally; downloaded models and dictionaries can be reused offline. First use needs internet and storage, and browser capabilities vary. Large translation models and dictionary packs download only when you choose them. NLLB is experimental and noncommercial.

## Run locally

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8765/`. Browser data is isolated by site and port. Export important learning data before moving origins or clearing site storage.

For translation contributions and catalog checks, see [i18n notes](docs/I18N.md). For design decisions, limitations and development history, see the [portfolio](docs/PORTFOLIO.md).
