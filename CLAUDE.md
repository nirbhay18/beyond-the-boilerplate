# CLAUDE.md

Companion site for Nirbhay Singh Rao's WordCamp Bengaluru 2026 talk
"Beyond the Boilerplate: Building High-Quality WordPress Plugins with AI"
(Sunday 22 Nov 2026, 10:30 AM, Xavier Hall). Theme: "Anyone can code now.
Shipping is another story."

## Project

- Static site for GitHub Pages. Plain HTML, CSS and JS. No build step,
  no frameworks, no dependencies. Keep it that way.
- `index.html`: talk page. Sections follow the talk: hero, four steps
  (Prompt, Structure, Automate, Review), red-flag bingo, rules file,
  starter kit, review questions, "Go further" resources, closing CTA to
  the generator.
- `generator/`: rules file generator. Logic in `assets/generator.js`;
  outputs AGENTS.md, CLAUDE.md, Cursor `.mdc` or Copilot instructions.
  Runs entirely in the browser.
- `files/`: downloadable starter kit (AGENTS.md template, phpcs.xml.dist,
  composer.json, phpstan.neon.dist, ci.yml). Keep the inline copies in
  `index.html` in sync with these files.
- Repo: git@github.com-personal:nirbhay18/beyond-the-boilerplate.git
  Pages URL: https://nirbhay18.github.io/beyond-the-boilerplate/

## Commands

- Preview: `python3 -m http.server 8000`, open http://localhost:8000
- Check JS syntax: `node --check assets/generator.js assets/site.js`

## Rules

- Accuracy first: every WordPress rule on the site or in the generator
  must be correct for current WordPress. A wrong rule gets copied into
  every plugin that uses it. If unsure, check the WordPress developer
  handbook or WPCS docs before changing a rule.
- Palette and fonts match the slides: ink #14202E, paper #F5F3EE,
  blue #3858E9, orange #F0894F; Space Grotesk, Inter, JetBrains Mono.
- Must work on a phone (people arrive via a QR code). Check at 390px
  wide that nothing overflows horizontally.
- Generated rules files stay short (under ~120 lines with everything on).

## Verified facts (don't change without re-testing)

- With phpcs.xml.dist + WPCS, the talk's draft-1 testimonials handler
  reports 16 errors and 2 warnings on 5 lines. The fixed draft 2 gives
  0 errors and 1 expected warning (direct DB call on a custom table).

## Status / next steps

1. Push to `main` (repo already has a GitHub-created README; pull with
   `--allow-unrelated-histories -X ours`, then push).
2. Enable Pages: Settings > Pages > Deploy from a branch > main / root.
3. Replace `#slides-link-todo` in index.html (hero button + footer)
   once the slides are shared.
4. The slide deck lives in claude.ai (a Slides artifact), not here.
   Its closing slide needs the site URL and a QR code.
