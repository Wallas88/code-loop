# Code Loop — ownership and product records

Prepared locally on **16 September 2026** for the existing Code Loop review copy, version **1.0.0**.

Company name: **Code Waldo**. Owner named by the user: **Waldo Trytsman**.

This folder collects provenance, third-party notices, a source fingerprint and documents to complete before a commercial release. It is an internal preparation pack, not a copyright registration, legal opinion, signed assignment or finished customer licence.

## Start here

1. Review the supplied owner and company names in [OWNER-DETAILS.md](OWNER-DETAILS.md), then complete the remaining entity, contact and input-rights details.
2. Review [DEVELOPMENT-RECORD.md](DEVELOPMENT-RECORD.md), which distinguishes your direction and supplied project from the AI-assisted implementation.
3. Keep [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) and the unmodified font notices with any distributed fonts.
4. Complete [PRODUCT-DECISIONS.md](PRODUCT-DECISIONS.md), then adapt [COPYRIGHT-NOTICE-TEMPLATE.txt](COPYRIGHT-NOTICE-TEMPLATE.txt). The template has not been applied as the app's licence.
5. Use [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md) when you decide to release a product.

For the distinction between your supplied website code and the newly generated game, read [SOURCE-ORIGINS.md](SOURCE-ORIGINS.md). It includes a file comparison, lesson-by-lesson trace and the factual basis for recording your claim over the generated parts.

## What is recorded, and what still needs a decision

| Recorded now | Still to confirm |
| --- | --- |
| Working title: Code Loop; associated project: SiteReviveSA | Final product name and any name/trade-mark clearance |
| Owner named by the user: Waldo Trytsman; company name: Code Waldo | Whether rights are held personally or by a separate entity; supporting rights and contracts |
| A locally developed, AI-assisted application | Applicable account terms and scope of enforceable rights |
| Two bundled OFL fonts and their existing notices | Any new third-party material introduced before release |
| No npm dependencies declared; Node runtime not bundled | Licensing and notices if an installer later bundles a runtime |
| Local source hashes and existing verification reports | Release approval, appropriate customer terms and legal review |

Nothing in this pack grants a public licence, publishes the app, registers a name or assigns rights to another party. The original font notices in assets/ remain in place; matching copies are in [font-licenses/](font-licenses/).

## Source fingerprint

[evidence/baseline-sha256.json](evidence/baseline-sha256.json) records the app's source, assets and tests as they existed when this pack was made. It excludes this ownership folder, verification outputs and dependencies. From the Code Loop folder, run:

```sh
node ownership/check-snapshot.mjs
```

The command reports changed, missing or added files without modifying them. Later source edits are expected to change the result. Preserve this baseline and create a separately named snapshot for future releases.

A hash identifies bytes. The machine's recorded time is not an independent timestamp, and neither establishes authorship or legal ownership. Keep dated requirements, revisions, contributor agreements and release records as separate evidence.

## Sources

Links, access dates and limited summaries are in [SOURCES.md](SOURCES.md). These should be checked again when commercialisation is considered. Ownership records are local files; the practice app's server does not expose this folder.
