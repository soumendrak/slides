# reveal.js 6.0.2 (vendored)

Local copies so a deck can run with no network. Files come from
`https://cdnjs.cloudflare.com/ajax/libs/reveal.js/6.0.2/<file>` and match cdnjs's published SRI.
`LICENSE` is from the npm package `reveal.js@6.0.2`.

`theme/night.min.css` is the one changed file. Its two leading Google Fonts `@import`s are
removed (`slides.css` sets its own fonts, so they were never used). Upstream sha256:
`85fcb21a0fe1fcad07733b7497ee00be206d5791caa83c5fda85d163b83faa10`.

| File | sha256 |
|---|---|
| reset.min.css | 210413954db19ce3c47b4456863e0eb8dec321c7d5d378dd0ff62cb6160f96ca |
| reveal.min.css | 13229a37166ed4b62f510e8b1397a7d99707530373d6e5e620575b600d6b6b27 |
| theme/night.min.css | 80cf26b6cb55c8b6c90888a4f251d8850d82d10eb8e10be579240c78aba29f34 |
| reveal.min.js | 59d7d5bec5ecac54cd69c526f7de66f2f890fde8484afdd844d6833337f0fe22 |
| plugin/markdown.min.js | c2d1c6a3b4edd0c441ff45734482290bdede4dbf1990d11d6555f238565dfc42 |
| plugin/notes.min.js | da3307263b0d5936f6618e586afa14fd2cc67071e2cac63f36a9fbf924b5326c |
| LICENSE | b2883e4b610bfa1b4d8fff84c4d4b825cc7d553cbd9fec4777c04068a2859dc0 |

Check with `sha256sum -c` against this table.
