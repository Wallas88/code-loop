export const CHAPTERS = [
  {
    "id": "files",
    "number": "01",
    "name": "Find your way around",
    "tag": "THE MAP",
    "description": "Know which file to open before changing anything.",
    "icon": "folder",
    "color": "lime"
  },
  {
    "id": "markup",
    "number": "02",
    "name": "Read what you see",
    "tag": "HTML & JSX",
    "description": "Turn tags, labels and components into plain English.",
    "icon": "code",
    "color": "blue"
  },
  {
    "id": "styles",
    "number": "03",
    "name": "Make it look right",
    "tag": "CSS & LAYOUT",
    "description": "Understand spacing, buttons and smaller screens.",
    "icon": "layout",
    "color": "peach"
  },
  {
    "id": "react",
    "number": "04",
    "name": "Make things happen",
    "tag": "REACT & STATE",
    "description": "Follow clicks, changing values and repeating content.",
    "icon": "bolt",
    "color": "purple"
  },
  {
    "id": "fixes",
    "number": "05",
    "name": "Think through a fix",
    "tag": "YOUR REAL PROJECT",
    "description": "Connect the pieces and change them with intention.",
    "icon": "tool",
    "color": "lime"
  }
];

export const LESSONS = [
  {
    "id": "files-prices",
    "chapter": "files",
    "title": "A price has a home.",
    "file": "src/content/hosting.ts",
    "code": "price: {\n  monthly: 289,\n  annual: 2890,\n  setup: 750\n}",
    "teach": "Content files store the information a component displays. A hosting price is data; the button's colour is styling.",
    "prompt": "You want to change the Static Lite monthly price. Which file should you open?",
    "choices": [
      "src/styles/hosting.css",
      "src/content/hosting.ts",
      "public/showcase/sbb.jpg"
    ],
    "answer": 1,
    "why": "src/content/hosting.ts holds the plan data. HostingSection reads that data and displays it. You can change a price without editing the layout.",
    "hint": "Look for the folder named content.",
    "type": "choice"
  },
  {
    "id": "files-styles",
    "chapter": "files",
    "title": "Find the button's clothes.",
    "file": "src/styles/global.css",
    "code": ".button {\n  min-height: 44px;\n  border-radius: 10px;\n}",
    "teach": "CSS controls appearance. A selector such as .button means: apply these styles to elements carrying the button class.",
    "prompt": "Where would you investigate the shared button shape?",
    "choices": [
      "src/styles/global.css",
      "src/content/hosting.ts",
      "worker/index.ts"
    ],
    "answer": 0,
    "why": "The shared .button rules live in global.css. Component styles can add to them, so check the relevant component stylesheet if a button differs.",
    "hint": "The .css extension identifies a stylesheet.",
    "type": "choice"
  },
  {
    "id": "files-behaviour",
    "chapter": "files",
    "title": "Find what makes it move.",
    "file": "src/features/work/use-work-carousel.ts",
    "code": "function step(dir) {\n  const next = (index + dir + count) % count;\n  setIndex(next);\n}",
    "teach": "The showcase component describes what appears. Its carousel hook manages behaviour, such as selecting the next project. This is a shortened excerpt.",
    "prompt": "You need to understand what the next-project arrow does. Start in…",
    "choices": [
      "public/showcase/",
      "src/content/faqs.ts",
      "src/features/work/use-work-carousel.ts"
    ],
    "answer": 2,
    "why": "The carousel hook owns the changing project index and movement. WorkSection.tsx connects that behaviour to the visible buttons.",
    "hint": "A file named use… is often a React hook: a reusable piece of behaviour.",
    "type": "choice"
  },
  {
    "id": "files-assets",
    "chapter": "files",
    "title": "A picture is a file too.",
    "file": "public/showcase/",
    "code": "public/\n  showcase/\n    sbb.jpg\n    sbb-mobile.jpg\n  fonts/",
    "teach": "The public folder contains files served as they are, including pictures and fonts. Project data points to those files.",
    "prompt": "Where would you look for a showcase screenshot?",
    "choices": [
      "src/hooks/",
      "public/showcase/",
      "src/app/"
    ],
    "answer": 1,
    "why": "Images belong in public/showcase/. Their filenames are referenced by the project data in src/content/work.ts.",
    "hint": "Choose the folder that stores assets, rather than code.",
    "type": "choice"
  },
  {
    "id": "files-source",
    "chapter": "files",
    "title": "Edit the recipe.",
    "file": "Project folders",
    "code": "src/      ← source you maintain\npublic/   ← assets you maintain\ndist/     ← generated production build",
    "teach": "A build creates the dist folder from your source. Building again replaces generated files.",
    "prompt": "You want a change to survive the next build. Where do you edit?",
    "choices": [
      "The generated file in dist/",
      "Only the browser inspector",
      "The relevant source file in src/"
    ],
    "answer": 2,
    "why": "Edit the source, then build. A browser-inspector experiment or a direct dist edit is temporary.",
    "hint": "Think about which folder is the input to the build.",
    "type": "choice"
  },
  {
    "id": "files-theme",
    "chapter": "files",
    "title": "Keep a feature together.",
    "file": "src/features/theme/",
    "code": "theme/\n  PaletteControl.tsx\n  colors.ts\n  palettes.ts",
    "teach": "A feature folder groups a related interface and its supporting code. The colour picker has its own feature, separate from navigation layout.",
    "prompt": "Where do you start when learning how custom colours are calculated?",
    "choices": [
      "src/features/theme/colors.ts",
      "src/pages/legal/PrivacyNotice.tsx",
      "src/content/offers.ts"
    ],
    "answer": 0,
    "why": "colors.ts holds colour calculations. PaletteControl.tsx uses them to operate the picker. A clear boundary makes the code easier to follow.",
    "hint": "Choose the file that describes the calculation.",
    "type": "choice"
  },
  {
    "id": "markup-label",
    "chapter": "markup",
    "title": "Read a button aloud.",
    "file": "src/components/Hero.tsx",
    "code": "<button>\n  Discuss your website\n</button>",
    "teach": "An opening tag starts an element. A closing tag ends it. Text between the two becomes the element's visible content. This example simplifies the site's link into a button.",
    "prompt": "What words appear on this button?",
    "choices": [
      "button",
      "Discuss your website",
      "Hero.tsx"
    ],
    "answer": 1,
    "why": "The tag says what the element is. The words between the tags say what the visitor reads.",
    "hint": "Read the line between <button> and </button>.",
    "type": "choice"
  },
  {
    "id": "markup-class",
    "chapter": "markup",
    "title": "Connect JSX to CSS.",
    "file": "src/components/Hero.tsx",
    "code": "<a className=\"button button-primary\">\n  Discuss your website\n</a>",
    "teach": "JSX is the HTML-like notation React uses for its interface. In JSX, className attaches CSS classes. Here the element gets two classes.",
    "prompt": "Which CSS selector targets the button-primary class?",
    "choices": [
      "#button-primary",
      "<button-primary>",
      ".button-primary"
    ],
    "answer": 2,
    "why": "A dot selects a class in CSS: .button-primary. The # prefix selects an id instead.",
    "hint": "Classes use a dot in CSS.",
    "type": "choice"
  },
  {
    "id": "markup-href",
    "chapter": "markup",
    "title": "Where does this link go?",
    "file": "src/components/Hero.tsx",
    "code": "<a href=\"#contact\">\n  Discuss your website\n</a>",
    "teach": "href is a link's destination. A destination starting with # points to an element id on the same page.",
    "prompt": "What happens when someone follows this link?",
    "choices": [
      "The browser goes to the contact section",
      "An email is automatically sent",
      "The button colour changes"
    ],
    "answer": 0,
    "why": "#contact targets the section with id=\"contact\". Following the link moves there; it does not submit the form.",
    "hint": "The #contact value matches a section id.",
    "type": "choice"
  },
  {
    "id": "markup-value",
    "chapter": "markup",
    "title": "Let the data speak.",
    "file": "src/features/hosting/HostingSection.tsx",
    "code": "const plan = { name: 'Static Lite' };\n\n<h3>{plan.name}</h3>",
    "teach": "Curly braces inside JSX let code supply a value. A dot reads a named property from an object.",
    "prompt": "What does the heading display?",
    "choices": [
      "plan.name",
      "Static Lite",
      "{Static Lite}"
    ],
    "answer": 1,
    "why": "plan.name reads the name property, which contains 'Static Lite'. React displays that text without the braces.",
    "hint": "First find the value beside name.",
    "type": "choice"
  },
  {
    "id": "markup-props",
    "chapter": "markup",
    "title": "One component, different input.",
    "file": "src/features/hosting/HostingSection.tsx",
    "code": "<PlanCard plan={plan} billing=\"annual\" />",
    "teach": "A component is a reusable piece of interface. Props are named inputs passed into it. This teaching excerpt passes plan data and a billing value.",
    "prompt": "What value is being passed in the billing prop?",
    "choices": [
      "monthly",
      "PlanCard",
      "annual"
    ],
    "answer": 2,
    "why": "The parent passes the string 'annual'. PlanCard can use that input to choose the annual price.",
    "hint": "Read the value after billing=.",
    "type": "choice"
  },
  {
    "id": "markup-edit",
    "chapter": "markup",
    "title": "Make the next step clearer.",
    "file": "Teaching example · button label",
    "code": "<button>\n  ___\n</button>",
    "teach": "You can change an element's visible label without changing what clicking it does. Behaviour is wired separately.",
    "prompt": "Fill the blank so the button says Start practice.",
    "answers": [
      "Start practice"
    ],
    "why": "The text inside the tags becomes the label. This edit changes wording, not click behaviour.",
    "hint": "Use the two words requested, with a capital S.",
    "example": "Start practice",
    "type": "input"
  },
  {
    "id": "styles-height",
    "chapter": "styles",
    "title": "Give a finger enough room.",
    "file": "src/styles/global.css",
    "code": ".button {\n  min-height: ___;\n}",
    "teach": "min-height sets the smallest allowed height. Content may still make the element taller. px means CSS pixels.",
    "prompt": "Complete the value to make the button at least 44 pixels tall.",
    "answers": [
      "44px",
      "44px;"
    ],
    "why": "min-height: 44px gives the button a minimum size without forcing a fixed height that might clip wrapping text.",
    "hint": "A CSS length needs both a number and a unit.",
    "example": "44px",
    "type": "input"
  },
  {
    "id": "styles-padding",
    "chapter": "styles",
    "title": "Space inside the box.",
    "file": "Teaching example · card CSS",
    "code": ".card {\n  padding: 24px;\n}",
    "teach": "Padding is space inside an element, between its content and its border. Margin is space outside its border.",
    "prompt": "What does this rule add?",
    "choices": [
      "24 pixels between neighbouring cards",
      "24 pixels of space inside the card",
      "A border 24 pixels thick"
    ],
    "answer": 1,
    "why": "Padding moves the content away from the card's edges. It doesn't directly set the distance between separate cards.",
    "hint": "Imagine the cushion inside the card.",
    "type": "choice"
  },
  {
    "id": "styles-gap",
    "chapter": "styles",
    "title": "Space between neighbours.",
    "file": "src/styles/work.css",
    "code": ".stage-nav {\n  display: flex;\n  gap: 10px;\n}",
    "teach": "Flexbox lays out a group of items. gap sets the space between those items.",
    "prompt": "What is 10 pixels wide here?",
    "choices": [
      "The space between navigation items",
      "Every button",
      "The entire navigation row"
    ],
    "answer": 0,
    "why": "The gap separates neighbouring flex items. The buttons keep the sizes defined by their own rules.",
    "hint": "The property is called gap, not width.",
    "type": "choice"
  },
  {
    "id": "styles-mobile",
    "chapter": "styles",
    "title": "Read the screen rule.",
    "file": "src/styles/work.css",
    "code": "@media (max-width: 700px) {\n  .stage-btn {\n    width: 44px;\n  }\n}",
    "teach": "A media query applies rules only when a condition matches. max-width includes that width and all smaller viewport widths.",
    "prompt": "At which viewport width does this rule apply?",
    "choices": [
      "1440px",
      "900px",
      "390px"
    ],
    "answer": 2,
    "why": "390 is less than 700, so the condition matches. At 900 or 1440 it does not. These are CSS viewport pixels.",
    "hint": "max-width means this wide or narrower.",
    "type": "choice"
  },
  {
    "id": "styles-grid",
    "chapter": "styles",
    "title": "Let a column shrink.",
    "file": "src/styles/work.css",
    "code": ".work-body {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);\n}",
    "teach": "1fr uses the available share of grid space. minmax(0, 1fr) allows the column to shrink below its content's default minimum size.",
    "prompt": "Why did we use this on the showcase?",
    "choices": [
      "To make all text disappear",
      "To let the column fit narrow screens",
      "To speed up the carousel timer"
    ],
    "answer": 1,
    "why": "A grid's automatic minimum can let content force the column wider than the phone. A zero minimum allows the track to fit its container; its children still need appropriate sizing.",
    "hint": "This change addresses layout width.",
    "type": "choice"
  },
  {
    "id": "styles-stable",
    "chapter": "styles",
    "title": "Make room before it changes.",
    "file": "src/styles/hosting.css",
    "code": ".offer-price {\n  min-height: 90px;\n}",
    "teach": "Monthly and annual price notes can occupy different amounts of space. Reserving enough height helps neighbouring controls stay still.",
    "prompt": "What is the reason for reserving price space?",
    "choices": [
      "To hide the annual price",
      "To charge for more hosting",
      "To reduce layout movement when billing changes"
    ],
    "answer": 2,
    "why": "The space prevents shorter text from pulling the content below upward. We checked the current prices at different viewport sizes.",
    "hint": "Think about the quote button below the price.",
    "type": "choice"
  },
  {
    "id": "react-state",
    "chapter": "react",
    "title": "A value the screen remembers.",
    "file": "Teaching excerpt · theme picker",
    "code": "const [open, setOpen] = useState(false);",
    "teach": "State is a value React remembers between renders. open reads the current value. setOpen requests a change. false is the initial value.",
    "prompt": "What is open before any interaction?",
    "choices": [
      "false",
      "true",
      "setOpen"
    ],
    "answer": 0,
    "why": "useState(false) starts open as false. A later call to setOpen can change it and cause React to render the new state.",
    "hint": "Look inside useState(…).",
    "type": "choice"
  },
  {
    "id": "react-click",
    "chapter": "react",
    "title": "Follow the click.",
    "file": "Teaching excerpt · theme picker",
    "code": "const [open, setOpen] = useState(false);\n\nfunction openPicker() {\n  setOpen(true);\n}\n\n<button onClick={openPicker}>\n  Open picker\n</button>",
    "teach": "onClick receives a function to run after a click. Here the function has a name, openPicker, and the button is handed that name.",
    "prompt": "What does clicking the button request?",
    "choices": [
      "A new CSS file",
      "open becomes true",
      "The website closes"
    ],
    "answer": 1,
    "why": "The click runs the function, which calls setOpen(true). React can then display interface that depends on open.",
    "hint": "Follow the code after onClick.",
    "type": "choice"
  },
  {
    "id": "react-next",
    "chapter": "react",
    "title": "Use the previous value.",
    "file": "Teaching excerpt · carousel",
    "code": "function increment(current) {\n  return current + 1;\n}\n\nsetIndex(increment);",
    "teach": "This updater function receives the current state value and returns the next value. The name current is just a parameter.",
    "prompt": "If current is 2, what value does this updater return?",
    "choices": [
      "1",
      "2",
      "3"
    ],
    "answer": 2,
    "why": "It returns 2 + 1, which is 3. The full carousel also wraps the index at the end of the project list.",
    "hint": "Substitute 2 for current.",
    "type": "choice"
  },
  {
    "id": "react-condition",
    "chapter": "react",
    "title": "One condition, two labels.",
    "file": "src/features/enquiry/ProjectEnquiryForm.tsx",
    "code": "isSubmitting ? 'Sending…' : 'Send project enquiry'",
    "teach": "The conditional expression reads: condition ? value when true : value when false.",
    "prompt": "Which label appears when isSubmitting is true?",
    "choices": [
      "Sending…",
      "Send project enquiry",
      "Both labels"
    ],
    "answer": 0,
    "why": "The value immediately after ? is chosen when the condition is true. The value after : is chosen when it is false.",
    "hint": "Read the first option after the question mark.",
    "type": "choice"
  },
  {
    "id": "react-map",
    "chapter": "react",
    "title": "Build a card for each plan.",
    "file": "Teaching excerpt · hosting section",
    "code": "function planCard(plan) {\n  return <PlanCard key={plan.id} plan={plan} />;\n}\n\nHOSTING_PLANS.map(planCard)",
    "teach": "An array is a list. map transforms each list item into a new value. Here each plan becomes a card element, and key identifies it for React.",
    "prompt": "If there are four plans, how many PlanCard elements are created?",
    "choices": [
      "One",
      "Four",
      "Eight"
    ],
    "answer": 1,
    "why": "map runs the callback once for each item. Four plans produce four card elements.",
    "hint": "One list item becomes one card.",
    "type": "choice"
  },
  {
    "id": "react-cleanup",
    "chapter": "react",
    "title": "Stop the old timer.",
    "file": "src/features/work/use-work-carousel.ts",
    "code": "function startTimer() {\n  const id = setInterval(next, 20000);\n  function stopTimer() {\n    clearInterval(id);\n  }\n  return stopTimer;\n}\n\nuseEffect(startTimer, []);",
    "teach": "An effect runs work outside rendering. Its returned function is cleanup. This shortened example creates a timer and provides a way to stop it.",
    "prompt": "What is the cleanup function for?",
    "choices": [
      "Changing the button label",
      "Deleting the project's files",
      "Stopping the interval when the effect is cleaned up"
    ],
    "answer": 2,
    "why": "clearInterval stops the timer. React runs effect cleanup when needed, including when the component is removed, preventing that old interval from continuing.",
    "hint": "The function's name tells you what it clears.",
    "type": "choice"
  },
  {
    "id": "fixes-price",
    "chapter": "fixes",
    "title": "Change only the monthly price.",
    "file": "src/content/hosting.ts",
    "code": "price: { monthly: ___, annual: 2890, setup: 750 }",
    "teach": "Each property in this object has its own value. Changing monthly does not automatically recalculate annual or setup in the real project.",
    "prompt": "For this exercise, set monthly to 299. Keep the other values as shown.",
    "answers": [
      "299"
    ],
    "why": "Only monthly becomes 299. In a real pricing change, review the annual amount and wording separately to keep the offer consistent.",
    "hint": "Enter the number only. This is practice data, not a live price change.",
    "example": "299",
    "type": "input"
  },
  {
    "id": "fixes-id",
    "chapter": "fixes",
    "title": "Rename without breaking links.",
    "file": "src/content/work.ts",
    "code": "{\n  id: 'sbb-software',\n  name: 'SBB Software'\n}\n\nHERO_STACK = ['sbb-software'];",
    "teach": "A stable id identifies a record even if its display name changes. Your refactor uses ids for hero selection.",
    "prompt": "You update this project's display name. Which value should stay stable?",
    "choices": [
      "name",
      "id",
      "The visible caption"
    ],
    "answer": 1,
    "why": "Keep id stable because HERO_STACK refers to it. The name can change independently.",
    "hint": "The hero list contains the internal identifier.",
    "type": "choice"
  },
  {
    "id": "fixes-target",
    "chapter": "fixes",
    "title": "A click is not always a swipe.",
    "file": "src/features/work/use-work-carousel.ts",
    "code": "if (event.target.closest('button, a')) return;",
    "teach": "event.target is the element where the event started. closest checks it and its ancestors for a match. return leaves the handler early.",
    "prompt": "Why skip drag handling when the press starts on a button or link?",
    "choices": [
      "To allow its own click action to work",
      "To hide the button",
      "To turn every tap into a swipe"
    ],
    "answer": 0,
    "why": "The carousel must leave buttons and links to their own interactions. Starting a drag there could interfere with their click.",
    "hint": "Think about pressing the carousel's Next button.",
    "type": "choice"
  },
  {
    "id": "fixes-timer",
    "chapter": "fixes",
    "title": "Milliseconds into seconds.",
    "file": "src/features/work/use-work-carousel.ts",
    "code": "const AUTOPLAY_MS = 20000;",
    "teach": "A millisecond is one thousandth of a second. Browser timer delays are written in milliseconds; actual execution can be delayed by the browser.",
    "prompt": "How many seconds does 20000 milliseconds represent?",
    "answers": [
      "20",
      "20 seconds",
      "20s"
    ],
    "why": "20000 ÷ 1000 = 20 seconds. This is the requested autoplay delay, not a guarantee of exact timing.",
    "hint": "Divide by 1000.",
    "example": "20",
    "type": "input"
  },
  {
    "id": "fixes-threshold",
    "chapter": "fixes",
    "title": "Give a gesture a threshold.",
    "file": "src/features/work/use-work-carousel.ts",
    "code": "const DRAG_THRESHOLD = 56;",
    "teach": "A threshold is the amount a movement must reach before it is accepted. This carousel requires a sufficiently large sideways movement.",
    "prompt": "Why have a swipe threshold?",
    "choices": [
      "To load 56 projects",
      "To reduce accidental slide changes from small movements",
      "To make every tap last 56 seconds"
    ],
    "answer": 1,
    "why": "A small finger movement shouldn't necessarily change the project. The threshold helps distinguish an intentional swipe from a slight movement.",
    "hint": "Think of the difference between a small wobble and a swipe.",
    "type": "choice"
  },
  {
    "id": "fixes-check",
    "chapter": "fixes",
    "title": "Catch a platform surprise.",
    "file": "Project import checks",
    "code": "import Hero from '../components/hero.tsx';\n\nActual filename: Hero.tsx",
    "teach": "Filename case matters on typical Linux filesystems. An import that appears to work on Windows can fail after moving to Linux.",
    "prompt": "What should be corrected?",
    "choices": [
      "Rename the whole src folder",
      "Remove the component",
      "Use Hero.tsx with the same capital H"
    ],
    "answer": 2,
    "why": "The import path must match the actual filename. The project's import checker helps catch these mistakes before deploying.",
    "hint": "Compare the first letter of the two filenames.",
    "type": "choice"
  }
];

export const GLOSSARY = [
  [
    "HTML",
    "The structure of a page: headings, paragraphs, links and buttons.",
    "<button>Start</button>"
  ],
  [
    "JSX",
    "HTML-like notation inside TypeScript (or JavaScript) that React turns into interface elements.",
    "<h3>{plan.name}</h3>"
  ],
  [
    "CSS",
    "Rules that style elements: colour, spacing, shape and layout.",
    ".button { min-height: 44px; }"
  ],
  [
    "Selector",
    "The part of a CSS rule that chooses which elements it applies to.",
    ".button selects a class; #contact selects an id."
  ],
  [
    "Component",
    "A reusable piece of interface, written as a function that returns JSX.",
    "<PlanCard plan={plan} />"
  ],
  [
    "Prop",
    "An input passed to a component by its parent.",
    "billing=\"annual\""
  ],
  [
    "State",
    "A value React remembers and uses to update the screen.",
    "const [open, setOpen] = useState(false);"
  ],
  [
    "Hook",
    "A function for React state, effects or reusable behaviour. Hook names start with use.",
    "useState • useEffect • useWorkCarousel (use-work-carousel.ts)"
  ],
  [
    "Effect",
    "Work that React runs after rendering, often to synchronise with timers or browser systems.",
    "useEffect(startTimer, []);"
  ],
  [
    "Cleanup",
    "Code that stops or undoes work started by an effect.",
    "return stopTimer;"
  ],
  [
    "Object",
    "A group of named properties and their values.",
    "{ monthly: 289, annual: 2890 }"
  ],
  [
    "Array",
    "An ordered list of values.",
    "['static-lite', 'static', 'static-catalogue']"
  ],
  [
    "Function",
    "A reusable set of instructions that runs when called.",
    "function next() { setIndex(1); }"
  ],
  [
    "Boolean",
    "One of two values: true or false.",
    "const open = false;"
  ],
  [
    "Import / export",
    "How one file makes code available to another.",
    "export const price = 289;"
  ],
  [
    "Media query",
    "A condition that applies CSS for a particular viewport or preference.",
    "@media (max-width: 700px) { ... }"
  ],
  [
    "Padding / margin",
    "Padding is inside an element's border. Margin is outside it.",
    "padding: 24px; margin: 16px;"
  ],
  [
    "Build",
    "The step that turns maintained source into files ready to serve.",
    "src/ → build → dist/"
  ],
  [
    "Event handler",
    "A function that responds to an action, such as a click.",
    "onClick={openPicker}"
  ],
  [
    "Stable id",
    "An internal name kept consistent even when visible wording changes.",
    "id: 'sbb-software'"
  ]
];

