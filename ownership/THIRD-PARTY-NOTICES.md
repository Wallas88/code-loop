# Third-party inventory and notices

Reviewed against the local Code Loop folder on **16 September 2026**. This is an inventory of identifiable components, not an exhaustive originality or infringement clearance.

## Bundled fonts

| Asset | Copyright statement in its supplied notice | Licence | Notice files |
| --- | --- | --- | --- |
| assets/manrope-latin.woff2 | Copyright 2018 The Manrope Project Authors | SIL Open Font License 1.1 | [Original](../assets/LICENSE-Manrope.txt); [record copy](font-licenses/LICENSE-Manrope.txt) |
| assets/instrument-serif-italic-latin.woff2 | Copyright 2022 The Instrument Serif Project Authors | SIL Open Font License 1.1 | [Original](../assets/LICENSE-InstrumentSerif.txt); [record copy](font-licenses/LICENSE-InstrumentSerif.txt) |

These assets were copied from the supplied SiteReviveSA review project's public/fonts folder. Their included notices identify [the Manrope project](https://github.com/sharanda/manrope) and [the Instrument Serif project](https://github.com/Instrument/instrument-serif). The upstream binaries were not independently matched to a specific release.

The fonts may accompany a commercial app. Preserve their copyright statements and full licences when redistributing them. They remain OFL-licensed and must not be sold alone or relicensed as exclusively owned product assets. If changing the fonts, review modification, naming and attribution conditions. The OFL does not require the surrounding application to be open source. See [the official licence](https://openfontlicense.org/open-font-license-official-text/) and [FAQ 1.3–1.4](https://openfontlicense.org/ofl-faq/).

The copies in font-licenses/ are byte-identical records of the notices already in assets/. Keep the original notices in the release alongside the fonts; this internal folder need not be made public in full.

## Application and development tooling

- package.json declares no npm dependencies or devDependencies. The browser application imports its own local modules.
- Node.js is an externally installed runtime, not a bundled binary. The server and tests use Node's standard modules. A future installer that bundles Node needs a fresh runtime/third-party notice review.
- React is discussed in lessons; the game does not bundle the React runtime. Do not invent a React dependency or licence entry solely because the lessons contain JSX examples.
- SVG icon paths and the favicon are inline in the generated app source. No separate icon package was identified. Their independent originality has not been established by this inventory.
- Browser verification used Playwright and installed Edge outside the app directory. Those tools are not distributed as part of the app's source folder.
- SiteReviveSA examples and branding are recorded as user-supplied inputs in OWNER-DETAILS.md. That record does not establish ownership of any client or contributor material.

## Updates

When adding an image, font, library, audio clip, copied code fragment or runtime, record its source, version, licence, attribution requirements and any modifications before including it in a release. Recheck the inventory whenever the distribution package changes.
