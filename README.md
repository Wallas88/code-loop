# Code Loop — a code practice game

Built for Waldo Trytsman (company name: Code Waldo), using small teaching examples from the SiteReviveSA review copy. The game is separate from the website project. It does not edit or deploy that website.

Ownership, licence notices and preparation for a possible future product release are collected in [ownership/README.md](ownership/README.md). The records include fields still to confirm and a draft notice; they are not a legal registration or an adopted customer licence.

## Play it

**https://wallas88.github.io/code-loop/** — runs in the browser, nothing to install. Progress is saved in that browser only (localStorage); export a backup from **Your progress** if you switch browsers or devices.

## Run it locally

While the local server is running, open **http://127.0.0.1:4180/**.

To start it again on Windows, double-click **start.cmd** in this folder. It starts the local server and opens your browser. Keep the command window open while playing; close it or press Ctrl+C to stop.

Node.js is already available on the system used to create this game. There are no npm dependencies to install. From a terminal in this folder, you can also run:

```sh
node server.mjs
```

On Linux/WSL, use `sh start.sh`, or the same Node command above. Open the printed local address. The app needs a local server for its JavaScript modules; opening index.html directly as a file is not the supported launch method.

If the port is already in use, check whether Code Loop is already running at the address above. Another port can be selected with the CODE_LOOP_PORT environment variable. Browser progress belongs to its exact address, so export a backup before switching ports.

## Start here

1. Choose **Start my first loop**. Begin with the first trail, which teaches you where things live in your website.
2. Read the small code example and the “Before you try” explanation.
3. Choose an answer, or type a short value. Use a hint or “Walk me through it” when you need one.
4. After six rounds, take a break, try another loop, or open the Playground.

The five trails cover files and folders, HTML/JSX, CSS/layout, React/state and practical project fixes. All trails are open. There are 30 challenges, 20 field-guide entries and three real CSS playground challenges.

Examples are shortened for teaching. Some are simplified versions of the site's code rather than verbatim excerpts. They refer to the restructured review copy, not an independently verified live deployment. The HTML/JSX and JavaScript exercises check answers; they are not a full JavaScript or React runtime. The CSS playground renders actual CSS in an isolated iframe and checks the resulting styles.

## How repetition works

Each loop has six completed rounds. A wrong answer is explained and can be retried. Hints and walkthroughs are always available. A tricky challenge returns after three other completed rounds when the selected trail permits. The picker avoids the previous two questions when it has alternatives.

Unassisted answers gradually increase a challenge's confidence level. Reviews are scheduled after more practice rounds or, at higher levels, after one, three or seven days. “Practise again” can review familiar questions even before they are due. This is a simple practice schedule, not a formal assessment of programming ability.

Correct unassisted rounds earn 12 XP; hinted rounds earn 8; rounds needing a retry or walkthrough earn 5. A solved playground challenge earns 20 XP once. Progress is recorded when you select **Next small step**. Completed loops and the active round are saved.

## Your data stays local

- The server listens only on **127.0.0.1**, the local loopback address.
- App code, lesson content, fonts and the playground all run locally. No account, analytics or external service is used.
- Progress and playground CSS are kept in this browser's localStorage. Another browser/profile/address has its own progress. Clearing browser site data removes it.
- **Your progress → Download backup** saves a JSON file on your computer. **Restore backup** replaces the current browser progress with that file. Progress backups do not include playground CSS drafts.
- When browser storage is unavailable, practice still works for the open session and a notice advises you to save a backup.

Nothing was uploaded, published or deployed. A running local server is needed while playing, but an internet connection is not needed for the game itself.

## Files to maintain

| File | Purpose |
| --- | --- |
| src/lessons.js | Trails, all questions, explanations, hints and glossary |
| src/learning.js | Repetition, scoring, answer checks and backup validation |
| src/app.js | Screens, interactions, local saving and CSS playground |
| styles.css | Layout, colours and responsive rules |
| server.mjs | Small local HTTP server |
| tests/learning.test.mjs | Curriculum, progress, repetition and server checks |
| assets/ | Locally stored fonts and their licences |

Keep lesson ids stable when editing wording so saved progress still points to the right challenge. Each lesson has a chapter id, code example, explanation, prompt, answer, feedback and hint.

Run checks with `npm test` or `node --test tests/*.test.mjs`. No installation step is needed.

## Verification

Eight automated tests cover all 30 answers, the repetition rules, guided versus unassisted scoring, session completion/resume, backup validation and local-server file boundaries.

Browser checks cover a complete loop, wrong-answer recovery, hints, walkthroughs, scheduled repetition, reload persistence, backup export/restore, guide search, all three CSS challenges, one-time playground rewards and blocked storage. All five main views were checked at 320, 390, 600, 760, 820, 1024, 1440 and 1920 pixels. No JavaScript errors or external network requests were observed.

Testing used Windows Edge/Chromium with touch emulation. Physical phones, Safari and Linux execution were not tested. Records and screenshots are in verification/.
