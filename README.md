# Evans Marketing — marketing website

A four-page marketing site for **Evans Marketing**, the growth-strategy and
performance-marketing consultancy of Ariel Evans (Vancouver, B.C.).

Built from the design handoff in `Evans Marketing Website Design.zip`.

---

## What this is

Plain HTML, CSS and a little JavaScript. **There is no build step and no
dependencies** — no npm install, no compiler, nothing to keep up to date. What
you see in the files is exactly what the browser gets. The fonts are bundled
too, so the site makes no request to any third-party server.

## Running it locally

You can double-click `index.html` to open it, but a few things (the grain
texture, the accordion) behave better over a real web address. The easiest way:

```bash
# from this folder
python3 -m http.server 8000
```

Then open <http://localhost:8000> in your browser. Press `Ctrl+C` in the
terminal to stop it.

## The files

```
index.html            Home
services.html         Services (accordion + process)
about.html            About Ariel
contact.html          Contact (form + brands)

assets/css/fonts.css  @font-face rules for the three typefaces
assets/css/styles.css All styling for every page — one file
assets/js/main.js     The hero animation, the accordion and the contact form
assets/fonts/         The typefaces themselves (see the README in that folder)
assets/img/           Photography and graphics
favicon.ico           Browser tab icon (with assets/img/favicon.svg)
```

### Where to change things

| I want to change...              | Open this                                          |
| -------------------------------- | -------------------------------------------------- |
| A colour used across the site    | `assets/css/styles.css`, the `:root` block at the top |
| Wording on a page                | that page's `.html` file                            |
| The nav or the footer            | the same block near the top/bottom of **each** `.html` file |
| A service description            | `services.html`                                     |
| A photo                          | drop a new file in `assets/img/` and update the `src` |

> **Note:** because there is no build step, the header and footer are repeated
> in all four HTML files. If you change one, change all four. That is the price
> of having no tooling — it is a deliberate trade, and worth revisiting if the
> site grows past a handful of pages.

## About the running heads

An earlier revision opened most sections with a small tracked-caps "eyebrow"
label, often paired with a folio number — "We provide / 01", "The founder / 04",
"The index", "The standard", "Get in touch / 05", plus a meta row above the
hero. **The client had all of these removed**; headlines now sit directly on the
ground and the type does the signalling.

If you are adding a section, don't reintroduce them. Tracked caps survive only
where they are content rather than decoration: the nav, buttons, stat labels,
engagement tags, process step titles, the marquee category footnote, the photo
caption bar, and form field labels.

The same round restyled the header: nav state is shown by **weight, not
colour** (active page in Archivo Black, the rest in Archivo 600), and "Book a
session" became a compact solid button rather than a hairline link.

## The animated hero

The Home headline is built from four layered effects, all specified in the
`hero_animation` handoff:

1. **Meta line rise** — the top row fades up 14px on load.
2. **Type develops** — the headline is wiped in top-to-bottom with `clip-path`,
   like a photograph coming up in a tray.
3. **Red scan line** — a glowing 2px bar sweeps down across the headline, riding
   just ahead of the wipe. It bleeds past both gutters so it reads as crossing
   the page.
4. **Living fill + parallax** — the letterforms are filled with a photograph
   (`background-clip: text`) that slowly pans and zooms forever, while the whole
   headline drifts a few pixels toward your cursor and lifts away as you scroll.

Steps 1–3 are pure CSS (`@keyframes` near the top of the hero block in
`styles.css`). Step 4's parallax is `initHeroParallax()` in `main.js` — it writes
only to the slab wrapper's `transform` and `opacity`, coalesced through a single
`requestAnimationFrame`, so a mouse move costs one style write per frame.

Two things to know before editing it:

- **The fill image must be dark.** `hero-type-fabric.jpg` is deliberately
  greyscaled and gamma-crushed to a mean luma of about 70. A normally-exposed
  photo fills the letters with pale grey and the headline disappears against the
  cream ground. If you swap it, re-darken it and keep the `linear-gradient` wash
  layer above it.
- **Don't use a face.** A giant drifting eye is unsettling. Abstract texture
  only — fabric folds, dappled light, paper.

Anyone who has asked their system for reduced motion gets a static, fully
legible headline: the CSS animations are switched off and the JavaScript
attaches no listeners at all.

## The contact form

The form validates in the browser (required fields, email and phone format, a
600-character cap on the message) but **it does not send anything yet** — there
is no inbox behind it. Submitting shows a "thank you" state and a note saying so.

To connect it, sign up with a form service and add one attribute. In
`contact.html`, find:

```html
<form class="contact-form" novalidate>
```

and add the endpoint you were given:

```html
<form class="contact-form" data-endpoint="https://formspree.io/f/YOUR_ID" novalidate>
```

That is the only change needed — `assets/js/main.js` picks it up and POSTs the
fields there. [Formspree](https://formspree.io) and
[Netlify Forms](https://docs.netlify.com/forms/setup/) both work this way.

## Publishing it

Any static host works, because there is nothing to build. Point the host at
this folder and it is live:

- **GitHub Pages** — repository *Settings → Pages*, deploy from a branch, root folder
- **Netlify / Vercel / Cloudflare Pages** — drag the folder in, or connect the repo

## Deliberate departures from the design reference

The reference files are matched closely on colour, type and spacing. Five
places differ, each for a reason:

1. **Responsive layout.** The reference had no breakpoints at all — every grid
   was fixed. Tablet and mobile layouts are authored here (see the last section
   of `styles.css`): multi-column sections collapse to one column, the
   five-step process stacks, the header splits onto two rows.
2. **About stat labels.** The reference still colours these `#C9BCAE`, a
   light tone left over from an earlier dark hero — 1.7:1 against cream,
   effectively invisible. They use `#6B5F52`, which is what the handoff's own
   rule calls for ("label greys are ground-dependent: `#6B5F52` on light,
   `#C9BCAE` on dark"). The Home hero labels were already corrected upstream.
3. **Accessibility.** The accordion has real `aria-expanded` / `aria-controls`
   and its triggers sit inside headings; there is a skip link; the marquee has a
   readable list behind it; the hero animation, marquee, background blur and
   transitions all back off under `prefers-reduced-motion`.
4. **Self-hosted fonts.** The reference loaded Archivo, Archivo Black and
   Bodoni Moda from Google's CDN; the handoff recommends self-hosting in
   production, and that is what this does. The woff2 files live in
   `assets/fonts/` (268 KB, latin and latin-ext only), so the site makes no
   third-party request at all — nothing to block, nothing to go down. All three
   families are SIL Open Font License; the licences ship alongside them.
5. **Grain.** The reference generated film grain with an inline SVG
   `feTurbulence` filter, which is expensive to render. This uses the 160×160
   `grain.png` tile at the same opacity and blend mode — visually equivalent,
   far cheaper.
6. **Images.** The large source PNGs were converted to JPEG (10.4 MB → 0.9 MB).
   Every alpha channel was fully opaque, so nothing was lost. The originals are
   still in the design zip if you ever need them.

## Still to confirm with the client

Carried over from the design handoff — these are content decisions, not code:

- **Contact details are placeholders.** `hello@evansmarketing.ca` was invented
  for the independent brand and the phone number is Ariel's Lodestar line.
  Confirm both before launch.
- **Client logos** are text wordmarks standing in for real logos, and several
  are agency-of-record accounts from Ariel's agency tenure. Confirm usage rights.
- **Two photographs are AI-generated placeholders** —
  `editorial-portrait.jpg` (the blurred quote band) and `studio-flatlay.jpg`
  (About). Replace with a real shoot.
  - `hero-type-fabric.jpg` (the Home headline fill) is a draped-silk still-life.
    See "The animated hero" above before replacing it.
- **Business identity** — the site is branded "Evans Marketing" throughout; the
  legal/agency name was never confirmed.
