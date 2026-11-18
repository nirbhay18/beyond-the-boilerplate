// Rules file generator. Pure client-side: builds Markdown from the form.
(function () {
  const $ = (id) => document.getElementById(id);
  const on = (id) => $(id) && $(id).checked;

  const FORMATS = {
    agents:  { file: 'AGENTS.md', download: 'AGENTS.md', where: 'Save at your plugin’s root.' },
    claude:  { file: 'CLAUDE.md', download: 'CLAUDE.md', where: 'Save at your plugin’s root.' },
    cursor:  { file: '.cursor/rules/wordpress.mdc', download: 'wordpress.mdc', where: 'Save in .cursor/rules/ in your plugin.' },
    copilot: { file: '.github/copilot-instructions.md', download: 'copilot-instructions.md', where: 'Save in .github/ in your plugin.' },
  };

  function clean(v, fallback) { v = (v || '').trim(); return v || fallback; }

  function build() {
    const name   = clean($('name').value, 'My Plugin');
    const slug   = clean($('slug').value, 'my-plugin').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    const prefix = clean($('prefix').value, 'myplugin').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/_+$/, '');
    const ns     = ($('ns').value || '').trim();
    const php    = $('php').value;
    const wp     = $('wp').value;
    const P      = prefix + '_';
    const C      = prefix.toUpperCase() + '_';
    const fmt    = document.querySelector('input[name=fmt]:checked').value;
    const jokes  = on('o-jokes');

    const L = [];
    const add = (...lines) => L.push(...lines);
    const gap = () => { if (L.length && L[L.length - 1] !== '') L.push(''); };

    if (fmt === 'cursor') {
      add('---', `description: Rules for the ${name} WordPress plugin`, 'globs:', 'alwaysApply: true', '---', '');
    }
    add(`# ${name}: rules for AI coding agents`, '');
    add('<!-- Generated as a starting point. Read it, delete what doesn’t apply, add what only you know. -->');

    // Project
    gap(); add('## Project', '');
    add(`- WordPress plugin **${name}**. Slug and text domain: \`${slug}\`.`);
    add(`- Requires PHP ${php}+ and WordPress ${wp}+. Don’t use newer APIs without a fallback.`);
    add(`- Prefix every global function, option, hook, handle and transient with \`${P}\`; constants with \`${C}\`.`);
    if (ns) add(`- Classes live in \`src/\` under the \`${ns}\` namespace, PSR-4 autoloaded.`);

    // Commands
    const cmds = [];
    if (on('t-wpenv'))   cmds.push('- Start WordPress: `npx wp-env start`');
    if (on('t-phpcs'))   cmds.push('- Lint: `composer lint` (PHPCS + WordPress Coding Standards); auto-fix: `composer lint:fix`');
    if (on('t-phpstan')) cmds.push('- Static analysis: `composer analyse` (PHPStan with WordPress stubs)');
    if (on('t-phpunit')) cmds.push('- Tests: `composer test`');
    if (on('t-pcp'))     cmds.push(`- Plugin Check: \`wp plugin check ${slug}\``);
    if (on('f-blocks'))  cmds.push('- Build blocks: `npm run build` (`@wordpress/scripts`)');
    if (cmds.length) {
      gap(); add('## Commands', '', ...cmds);
      const gate = [on('t-phpcs') && '`composer lint`', on('t-phpstan') && '`composer analyse`', on('t-phpunit') && '`composer test`'].filter(Boolean);
      if (gate.length) {
        const list = gate.length > 1 ? gate.slice(0, -1).join(', ') + ' and ' + gate[gate.length - 1] : gate[0];
        add('', `Before saying a task is done, run ${list}. Fix what they report; don’t rewrite unrelated code.`);
      }
    }

    // Workflow
    gap(); add('## Workflow', '');
    add('- For a new feature, propose the files and class responsibilities first. Wait for approval.');
    add('- One class per file. The main plugin file only bootstraps.');
    add('- Small, focused changes. Call out any change to a hook, option, table or route name.');
    add('- Never edit `vendor/`, `node_modules/` or `build/`.');

    // Security
    gap(); add('## Security (non-negotiable)', '');
    add('- Every PHP file starts with `defined( \'ABSPATH\' ) || exit;`');
    add('- Input: `wp_unslash()` first, then the narrowest sanitizer: `sanitize_text_field()`, `sanitize_textarea_field()`, `sanitize_email()`, `sanitize_key()`, `absint()`, `esc_url_raw()`. Validate against allowed values.');
    add('- Output: escape late, for the context: `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses_post()`. Translated strings: `esc_html__()`, `esc_attr__()`.');
    add('- Every state-changing request checks a nonce AND `current_user_can()`.');
    add('- SQL only via `$wpdb->prepare()` (`%s`, `%d`, `%f`, `%i`) or `$wpdb->insert()` / `update()` / `delete()`. Never interpolate.');
    add('- Redirect with `wp_safe_redirect()` then `exit;`.');

    // APIs
    gap(); add('## WordPress APIs', '');
    add('- Enqueue assets with `wp_enqueue_script()` / `wp_enqueue_style()`, only on screens that need them. No inline `<script>`; use `wp_add_inline_script()`.');
    add(`- All user-facing strings are translatable with the literal text domain \`'${slug}'\`.`);
    add(`- \`uninstall.php\` checks \`WP_UNINSTALL_PLUGIN\` and removes the plugin’s options${on('f-tables') ? ', tables' : ''}${on('f-cron') ? ' and cron events' : ''}.`);

    if (on('f-settings')) {
      gap(); add('## Settings page', '');
      add(`- Use the Settings API: \`register_setting()\` with a \`sanitize_callback\`. Options are prefixed \`${P}\`.`);
      add('- Check `manage_options` (or a narrower capability) before rendering or saving.');
      add('- Large or rarely used options are not autoloaded.');
    }
    if (on('f-ajax')) {
      gap(); add('## AJAX', '');
      add(`- Register on \`wp_ajax_${P}{action}\`. Add \`wp_ajax_nopriv_\` only when logged-out users truly need it.`);
      add('- Verify with `check_ajax_referer()`; check capabilities for anything privileged.');
      add('- Respond with `wp_send_json_success()` / `wp_send_json_error()`.');
    }
    if (on('f-public')) {
      gap(); add('## Public forms', '');
      add('- Treat every field as hostile: sanitize, validate length and format, reject unknown fields.');
      add('- Add spam protection (honeypot or rate limit per IP via transients). Nonces alone don’t stop bots, and page caching can serve stale nonces.');
      add('- User-submitted content is stored as pending/unapproved until an admin approves it.');
    }
    if (on('f-rest')) {
      gap(); add('## REST API', '');
      add(`- Register routes on \`rest_api_init\` under \`${slug}/v1\`.`);
      add('- Every route has a real `permission_callback`. Never `__return_true` on routes that change or expose private data.');
      add('- Declare `args` with `sanitize_callback` and `validate_callback`. Return `WP_Error` with a status code on failure.');
    }
    if (on('f-blocks')) {
      gap(); add('## Blocks', '');
      add('- One folder per block with `block.json`; build with `@wordpress/scripts`; register with `register_block_type()` on the build folder.');
      add('- Dynamic blocks escape everything in `render.php` and use `get_block_wrapper_attributes()`.');
      add('- Use `@wordpress/*` packages and core components; don’t bundle React.');
    }
    if (on('f-cpt')) {
      gap(); add('## Custom post types', '');
      add(`- Register on \`init\` with prefixed names (max 20 characters) and explicit \`capability_type\`.`);
      add('- Flush rewrite rules only on activation, never on every request.');
    }
    if (on('f-tables')) {
      gap(); add('## Custom tables', '');
      add(`- Table names use \`$wpdb->prefix . '${P}…'\`. Create and upgrade with \`dbDelta()\` on activation.`);
      add(`- Store a schema version in an option (\`${P}db_version\`) and migrate when it changes.`);
      add('- Direct queries are expected here; still use `$wpdb->prepare()` and cache reads where it helps.');
    }
    if (on('f-cron')) {
      gap(); add('## Cron', '');
      add(`- Schedule with \`wp_schedule_event()\` on activation (check \`wp_next_scheduled()\` first); clear on deactivation. Hooks are prefixed \`${P}\`.`);
      add('- Jobs must be safe to run twice and must not assume a logged-in user.');
    }
    if (on('f-remote')) {
      gap(); add('## External APIs', '');
      add('- Use `wp_remote_get()` / `wp_remote_post()`, never cURL directly. User-supplied URLs use `wp_safe_remote_get()`.');
      add('- Set a timeout, check `is_wp_error()` and the response code, and cache results in transients.');
      add('- API keys live in options or constants, never in code.');
    }
    if (on('f-woo')) {
      gap(); add('## WooCommerce', '');
      add('- Use WooCommerce CRUD objects (`wc_get_order()`, `$order->get_meta()`), never direct post meta, so the plugin works with HPOS.');
      add('- Declare HPOS compatibility on `before_woocommerce_init`.');
      add('- Check WooCommerce is active before calling its functions.');
    }
    if (on('t-org')) {
      gap(); add('## WordPress.org directory', '');
      add('- GPLv2-or-later compatible code and assets only.');
      add('- `readme.txt` with accurate `Requires at least`, `Tested up to`, `Requires PHP` and `Stable tag`.');
      add('- No tracking, remote calls or ads without explicit opt-in. No loading code from external servers.');
      add('- Don’t bundle libraries WordPress already ships (jQuery, React).');
      if (on('t-pcp')) add('- Must pass Plugin Check with no errors.');
    }

    gap(); add('## Never', '');
    if (jokes) add('- Write `// TODO: add security later`. We both know.');
    add('- Use `__return_true` as a permission check for private data.');
    add('- Silence errors with `@` or `error_reporting( 0 )`' + (jokes ? ' for “peace of mind”.' : '.'));
    add('- Use `eval()`, `extract()`, or `unserialize()` on user input.');
    add('- Echo `$_GET`, `$_POST` or `$_SERVER` values without escaping.');

    return L.join('\n') + '\n';
  }

  // Light syntax colouring for the preview only.
  function highlight(md) {
    const esc = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return esc.split('\n').map((line) => {
      if (/^#{1,3} /.test(line)) return '<span class="k">' + line + '</span>';
      if (/^&lt;!--/.test(line) || /^---$/.test(line)) return '<span class="c">' + line + '</span>';
      return line.replace(/`([^`]+)`/g, '<span class="h">`$1`</span>');
    }).join('\n');
  }

  let current = '';
  function render() {
    current = build();
    const fmt = FORMATS[document.querySelector('input[name=fmt]:checked').value];
    $('out').innerHTML = highlight(current);
    $('out-file').textContent = fmt.file;
    const n = current.trim().split('\n').length;
    $('lines').textContent = n + ' lines';
    $('where').textContent = fmt.where;
    try { localStorage.setItem('btb-gen', JSON.stringify(state())); } catch (e) {}
  }

  const ids = ['name', 'slug', 'prefix', 'ns', 'php', 'wp'];
  function state() {
    const s = { fmt: document.querySelector('input[name=fmt]:checked').value };
    ids.forEach((id) => { s[id] = $(id).value; });
    document.querySelectorAll('#gen-form input[type=checkbox]').forEach((c) => { s[c.id] = c.checked; });
    return s;
  }
  function restore() {
    let s;
    try { s = JSON.parse(localStorage.getItem('btb-gen') || 'null'); } catch (e) { s = null; }
    if (!s) return;
    ids.forEach((id) => { if (typeof s[id] === 'string') $(id).value = s[id]; });
    document.querySelectorAll('#gen-form input[type=checkbox]').forEach((c) => { if (typeof s[c.id] === 'boolean') c.checked = s[c.id]; });
    const r = document.querySelector(`input[name=fmt][value="${s.fmt}"]`);
    if (r) r.checked = true;
  }

  // Suggest slug and prefix from the name until the user edits them.
  let slugTouched = false, prefixTouched = false;
  $('slug').addEventListener('input', () => { slugTouched = true; });
  $('prefix').addEventListener('input', () => { prefixTouched = true; });
  $('name').addEventListener('input', () => {
    const base = $('name').value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slugTouched) $('slug').value = base || 'my-plugin';
    if (!prefixTouched) {
      const words = base.split('-').filter(Boolean);
      $('prefix').value = words.length > 1 ? words.map((w) => w[0]).join('').slice(0, 6) : (words[0] || 'myplugin').slice(0, 8);
    }
  });

  $('gen-form').addEventListener('input', render);
  $('gen-form').addEventListener('change', render);
  $('copy').addEventListener('click', () => copyText(current));
  $('download').addEventListener('click', () => {
    const fmt = FORMATS[document.querySelector('input[name=fmt]:checked').value];
    const url = URL.createObjectURL(new Blob([current], { type: 'text/markdown' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: fmt.download });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Downloaded ' + fmt.download);
  });

  restore();
  render();
})();
