# Code Loop — where the code came from

Recorded locally on **16 September 2026** for **Waldo Trytsman**, company name **Code Waldo**.

The game uses the supplied SiteReviveSA project as teaching material. It also contains newly generated software that delivers the lessons. It is not a direct conversion of the website into a game, and the lesson snippets are not all verbatim quotations. This record makes those origins explicit.

## Copies compared

1. The user's original supplied audit folder: `C:/Users/waldo/OneDrive/Desktop/site-audit`.
2. The restructured copy in `outputs/site-audit-refactor/site`.
3. The later layout-review copy in `outputs/site-flow-preview/site`, which the game uses as its teaching reference.
4. The game in `outputs/code-loop`.

All **107 files** in the earlier original-file hash record still match the supplied audit folder. All **15 game files** covered by the ownership baseline still match that baseline. These comparisons verify file contents; they do not independently prove dates, authorship or legal title.

See [the file comparison](evidence/source-comparison.json), [the runtime review](evidence/runtime-provenance.json), [the readable lesson source map](LESSON-SOURCE-MAP.md) and [the detailed lesson evidence](evidence/lesson-provenance.json).

## What was reused and what was added

| Part of the game | Origin and evidence | What this establishes |
| --- | --- | --- |
| Hosting plan names and prices in the questions | Supplied `src/config/site.js`, subsequently extracted into [src/content/hosting.js](../../site-flow-preview/site/src/content/hosting.js); Static Lite retains monthly 289, annual 2890 and setup 750 | Concrete website data was used in the teaching examples. Prices and short names alone are not evidence of exclusive copyright. |
| Hero button/link wording | Supplied `src/components/Hero.jsx`, retained in [the reviewed Hero component](../../site-flow-preview/site/src/components/Hero.jsx) | The site's wording was reused, while tags and attributes were shortened or changed for particular questions. |
| Carousel examples | Supplied `src/hooks/useWorkCarousel.js`, moved to [src/features/work/useWorkCarousel.js](../../site-flow-preview/site/src/features/work/useWorkCarousel.js) | The autoplay timing, swipe threshold and event guard have identifiable source roots. Some examples simplify the original function. |
| Theme, form and other examples | Supplied website components and their later extracted feature files | Their topics and selected expressions come from the site; teaching text, questions, hints and some sample expressions were generated for the game. |
| Refactored paths and stable project IDs | The structural review introduced feature/content folders and the `sbb-software` ID in [work.js](../../site-flow-preview/site/src/content/work.js) | These examples reflect the reviewed project, not the folder structure or every identifier in the original supplied copy. |
| Stable carousel/price layout examples | The later layout pass added rules such as the reviewed [work.css](../../site-flow-preview/site/src/styles/work.css) grid and [hosting.css](../../site-flow-preview/site/src/styles/hosting.css) price space | Some lessons teach changes made during this task, rather than code that was present in the original upload. |
| Repetition, scoring, six-round sessions and saved progress | [src/learning.js](../src/learning.js), generated in this task | New game implementation created in response to the user's learning-game request. The website did not supply this learning engine. |
| Game interface, practice card, CSS checking, server and launchers | [src/app.js](../src/app.js), styles, HTML, local Node server, tests and launchers generated in this task | The interface and practice system are new implementation around the teaching material. The CSS labs are separate exercises, not live edits to the user's website. |
| Two fonts and their two licence notices | Exact file matches between the supplied site's `public/fonts`, the review copy and the game's `assets` | Actual asset reuse is confirmed. These remain third-party OFL assets, as explained in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). |

The runtime review found no identical whole executable files between the game and the website copies. That supports the recorded development history, but is not proof that every generated expression is original or that no ordinary code pattern overlaps other projects. No global prior-art or infringement search was performed.

The current lesson caption calls every example an "excerpt". That wording is too broad: the examples include shortened source, adaptations and newly written demonstrations. The lesson-by-lesson evidence is the more precise record. This provenance review does not change the running game or its baseline.

## Human direction and AI-generated implementation

The task records the following direction from Waldo Trytsman:

- Supply and describe the SiteReviveSA website/code as his own.
- Request a repeating game to help a beginner understand that code.
- Require the game to stay on his system, without uploading it.
- Request ownership and product-preparation records.
- Identify Code Waldo as the company name and Waldo Trytsman as the owner.
- Request this comparison to clarify the relationship between supplied code and generated parts.

The implementation record attributes the generation of the game engine, interface and teaching material to Codex responding to those requests. It does not say that Waldo manually wrote the generated implementation, selected every technical detail or independently reviewed every line. Later human edits and decisions should be recorded separately.

## What can be recorded about the generated parts

For this internal record, the stated ownership claim includes the new game implementation and teaching material created for Waldo Trytsman's project, to the extent rights exist and belong to him. It is not limited to the website snippets. This describes the user's claim; it does not create rights, certify title, adopt a public licence or assign rights to a separate company.

[OpenAI's individual Terms of Use](https://openai.com/policies/row-terms-of-use/) assign OpenAI's rights, if any, in output to the user, within the limits of applicable law. They do not grant someone else's rights or guarantee uniqueness. The actual account contract still needs confirming as recorded in [OWNER-DETAILS.md](OWNER-DETAILS.md); an organisation's contract may identify a different customer.

South African statutory definitions address the person arranging a computer-generated work and the person controlling the making of a computer program. The user's instructions and the development trail are therefore relevant evidence to assess, rather than grounds to assume that AI assistance automatically removes all protection. Applying those definitions, originality requirements and ownership rules to this particular game remains a legal assessment. See the [official 1992 amendment, section 1(d)](https://www.gov.za/sites/default/files/gcis_document/201409/act125of1992.pdf) and the [DTIC-hosted guide, authorship and ownership discussion](https://www.thedtic.gov.za/wp-content/uploads/publication-CCRD_Creative_Expressions.pdf). These references are background, not a legal opinion on the current project.

Owning the website inputs does not by itself establish exclusive copyright in every new game element. Conversely, calling the engine newly generated does not mean that OpenAI retains ownership of the output. The contractual assignment and the scope of enforceable copyright are separate questions.

## Remaining evidence for an ownership review

- Keep the original website history and relevant contributor, employment or client agreements; the local file match cannot establish those rights.
- Record which account/contract generated the work and who its customer was.
- Preserve this development task or an export if available, together with later human decisions and revisions. No full transcript export has been created by this review.
- Confirm whether the intended rights holder is Waldo personally or a separate legal entity using Code Waldo, and record any required assignment.
- Obtain an assessment of the specific claim before relying on exclusive rights commercially. No rewrite, filename, notice or locally generated declaration can substitute for that assessment.

All evidence in this folder remains local. No code or private source material was submitted to an external ownership registry or originality-checking service.
