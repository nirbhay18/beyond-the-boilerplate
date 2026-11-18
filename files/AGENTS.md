# AGENTS.md

<!--
  Starter rules file for a WordPress plugin, from the talk
  "Beyond the Boilerplate" (WordCamp Bengaluru 2026).
  Replace every value in [brackets], then delete the sections
  that don't apply. Short files get followed; long ones get skimmed.
-->

## Project

- WordPress plugin: **[Plugin Name]**, slug and text domain `[my-plugin]`.
- Requires PHP [7.4]+ and WordPress [6.5]+.
- Prefix for every global function, class, constant, option, hook,
  handle and transient: `[myplugin_]` (constants: `[MYPLUGIN_]`).
- PHP namespace: `[Vendor\MyPlugin]`, PSR-4 autoloaded from `src/`.

## Commands

- Install: `composer install`
- Lint: `composer lint` (PHPCS, WordPress Coding Standards)
- Fix formatting: `composer lint:fix`
- Static analysis: `composer analyse` (PHPStan)
- Tests: `composer test` (PHPUnit)
- Plugin Check: `wp plugin check [my-plugin]`

Run `composer lint` and `composer analyse` before you say a task is done.
If they fail, fix the reported lines. Do not rewrite unrelated code.

## Workflow

- Before writing code for a new feature, propose the files and class
  responsibilities, then wait for approval.
- One class per file. Keep the main plugin file to bootstrapping only.
- Make small, focused changes. Explain any change to a public hook,
  option name, database table or REST route.
- Never edit `vendor/`, `node_modules/` or `build/`.

## Security (non-negotiable)

- Every PHP file starts with `defined( 'ABSPATH' ) || exit;`
- Input: `wp_unslash()` first, then sanitize with the narrowest function:
  `sanitize_text_field()`, `sanitize_textarea_field()`, `sanitize_email()`,
  `sanitize_key()`, `absint()`, `esc_url_raw()`. Validate against allowed
  values where possible.
- Output: escape late, at the point of output, for the context:
  `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses_post()`.
  Translated output uses `esc_html__()` / `esc_attr__()`.
- Every state-changing request checks a nonce AND a capability:
  `check_admin_referer()` or `check_ajax_referer()`, plus `current_user_can()`.
- SQL only through `$wpdb->prepare()` (`%s`, `%d`, `%f`, `%i` for
  identifiers) or `$wpdb->insert()` / `update()` / `delete()`.
  Never interpolate variables into SQL.
- Redirect with `wp_safe_redirect()` followed by `exit;`.
- Remote requests use `wp_remote_get()` / `wp_remote_post()`;
  user-supplied URLs use `wp_safe_remote_get()`.

## WordPress APIs

- Load assets with `wp_enqueue_script()` / `wp_enqueue_style()`, only on
  the screens that need them. No inline `<script>` tags; use
  `wp_add_inline_script()` or `wp_localize_script()` for data.
- Settings: `register_setting()` with a `sanitize_callback`.
  Large or rarely-used options are not autoloaded.
- All user-facing strings are translatable with text domain `[my-plugin]`
  as a literal string, never a variable.
- Activation/deactivation hooks: schedule and clear cron events, flush
  rewrite rules only on activation.
- `uninstall.php` checks `defined( 'WP_UNINSTALL_PLUGIN' )` and removes
  the plugin's options, tables and scheduled events.

## AJAX (delete if unused)

- Register on `wp_ajax_[myplugin_action]`; add `wp_ajax_nopriv_` only when
  logged-out users genuinely need it, and then add spam/rate protection.
- Verify with `check_ajax_referer()`; reply with `wp_send_json_success()`
  or `wp_send_json_error()`.

## REST API (delete if unused)

- Register routes on `rest_api_init` under the `[my-plugin]/v1` namespace.
- Every route has a real `permission_callback`. Never `__return_true`
  for routes that change data or expose private data.
- Declare `args` with `sanitize_callback` and `validate_callback`.

## Blocks (delete if unused)

- One folder per block with `block.json`; build with `@wordpress/scripts`.
- Register with `register_block_type()` pointing at the build folder.
- Dynamic blocks escape everything in `render.php` and use
  `get_block_wrapper_attributes()`.

## WooCommerce (delete if unused)

- Use WooCommerce CRUD objects (`wc_get_order()`, `$order->get_meta()`),
  never direct post meta, so the plugin works with HPOS.
- Declare HPOS compatibility on `before_woocommerce_init`.

## WordPress.org directory (delete if not publishing there)

- GPLv2-or-later compatible code and assets only.
- `readme.txt` with accurate `Requires at least`, `Tested up to`,
  `Requires PHP` and `Stable tag`.
- No tracking, remote calls or ads without explicit opt-in.
- Don't bundle libraries WordPress already ships (jQuery, etc.).
- Must pass Plugin Check with no errors.

## Never

- Write `// TODO: add security later`. We both know.
- Use `__return_true` as a permission check for private data.
- Silence errors with `@` or `error_reporting( 0 )`.
- Use `eval()`, `extract()`, `serialize()` on user input, or `$_REQUEST`.
- Echo `$_GET`, `$_POST` or `$_SERVER` values directly.
