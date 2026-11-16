# Beta branch rules

Read VERSIONING.md and BETA-PLAN.md before edits. Work on beta/google-drive-sync in this clone (explicit user request). Do not push changes to main or deploy this beta to the existing production Site. Do not edit/publish the stable source at ../akai-sheet or deploy to the stable Site. Only user approval may raise the major version or merge the beta into stable. Record feature changes as minor releases and bug fixes as patch releases; prereleases use -beta.n. Keep the current release, UI asset cache keys, local package and release log aligned.

Book originals must stay on the user's device. This beta may sync explicitly consented learning records (including recognized annotation text) to the user's own Google Drive; it must not upload book files or call hosted recognition/translation services. Do not add hosted OCR/translation APIs. Never auto-download large translation weights before the user selects download permission. NLLB remains experimental, noncommercial, removable and subject to future removal review. Preserve EPUB sandbox restrictions.

The user authorized publishing this beta to its dedicated Site appgprj_6afac413d82c8191b8fe1836439b2716. Keep the original 1.0.0 Site appgprj_6ae82f2ab5788191bcab011edb47a54a unchanged.

2026-11-16 user authorization: apply i18n to both main and beta, publish their existing Sites and update GitHub. Transfer only localization changes to main; do not merge Drive beta features.
