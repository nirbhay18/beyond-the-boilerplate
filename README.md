# Beyond the Boilerplate

Companion site for **“Beyond the Boilerplate: Building High-Quality WordPress Plugins with AI”**, a talk by Nirbhay Singh Rao at WordCamp Bengaluru 2026.

> Anyone can code now. Shipping is another story.

## What’s here

| Path | What it is |
| --- | --- |
| `index.html` | The talk site: the four steps, red-flag bingo, rules file, starter kit, review checklist, further reading |
| `generator/` | Rules file generator: AGENTS.md, CLAUDE.md, Cursor and Copilot formats. Runs entirely in the browser |
| `files/AGENTS.md` | The full rules file template |
| `files/phpcs.xml.dist` | WordPress Coding Standards config with text domain and prefix checks |
| `files/composer.json` | Dev dependencies and `lint`, `lint:fix`, `analyse`, `test` scripts |
| `files/phpstan.neon.dist` | PHPStan config (uses WordPress stubs) |
| `files/ci.yml` | GitHub Actions workflow: PHPCS, PHPStan and the official Plugin Check action |

No build step, no dependencies. Plain HTML, CSS and JavaScript.

## Publish on GitHub Pages

1. Push this folder to the root of a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
4. After a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.

The `.nojekyll` file makes GitHub serve every file as is.

## Before the talk

Replace these placeholders (search for `TODO`):

- `#slides-link-todo` in `index.html` (hero button and footer): your slides link.

Then put the site URL on the closing slide, ideally as a QR code.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Contributing

Found a rule that’s wrong or outdated? Open an issue or a pull request. A wrong rule in a rules file gets copied into every plugin that uses it, so corrections are very welcome.

## License

Code samples and starter files are GPL-2.0-or-later, to match WordPress.
