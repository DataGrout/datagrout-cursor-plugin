# DataGrout plugins for Cursor

The official [Cursor Marketplace](https://cursor.com/marketplace) packaging for
[DataGrout](https://datagrout.ai). It contains one Cursor Plugin, `datagrout`, which
connects Cursor's agent to DataGrout MCP at `https://gateway.datagrout.ai/connect`
over OAuth 2.1 with automatic Dynamic Client Registration (DCR), so users set up no
client ID, API key or server ID.

This repository is packaging only: three JSON manifests, Markdown, and a logo.
DataGrout MCP and its tools run on DataGrout's servers; nothing here executes.
Changes to tools or auth happen in DataGrout, and this repo changes only when the
endpoint, metadata, skill text or logo changes.

User documentation lives in [`plugins/datagrout/README.md`](plugins/datagrout/README.md).

## Layout

```text
.cursor-plugin/marketplace.json        marketplace manifest, lists plugins/datagrout
plugins/datagrout/
  .cursor-plugin/plugin.json           plugin manifest
  mcp.json                             remote MCP server entry (url only)
  skills/datagrout-mcp/SKILL.md        discover → plan → perform workflow
  rules/datagrout.mdc                  when to route a request through DataGrout
  commands/datagrout.md                /datagrout command
  assets/logo.png                      listing logo (256×256, same as the Zapier listing)
  README.md                            install, connect, tools, privacy, support
scripts/
  validate-template.mjs                Cursor's validator, from cursor/plugin-template
  check-plugin.mjs                     DataGrout-specific submission checks
  sync-local.mjs                       copies the plugin into ~/.cursor/plugins/local
```

The plugin manifest names no component paths, so Cursor discovers `skills/`, `rules/`,
`commands/` and `mcp.json` by folder. Keep it that way: setting a path replaces
discovery for that component.

## Develop

Requires Node 18+ and Cursor desktop with local plugin imports allowed (on Teams and
Enterprise: **Dashboard → Settings → Security & Identity → Allow Local Plugin Imports**).

```bash
npm run validate   # Cursor's validator + DataGrout checks; CI runs the same on every push
npm run sync       # copy plugins/datagrout to ~/.cursor/plugins/local/datagrout
```

After `npm run sync`, run **Developer: Reload Window** in Cursor, then check:

1. **Customize** lists DataGrout with one MCP server, one skill, one rule and one command.
2. **Settings → MCP** shows `datagrout` with a **Connect** button.
3. Typing `/` in chat offers `datagrout-mcp` and `/datagrout`.

Re-run `npm run sync` after every change. Uninstall any Marketplace copy of DataGrout
while developing; it takes precedence over the local one.

## Release

1. Bump `version` in both `plugins/datagrout/.cursor-plugin/plugin.json` and
   `.cursor-plugin/marketplace.json` (`npm run validate` fails if they differ).
2. `npm run validate`, then tag the commit (`v1.0.1`, …).
3. Resubmit at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish).
   Marketplace plugins are not auto-updated; Cursor reviews every update.

Team marketplaces imported with Auto Refresh pick up pushes to `main` within minutes,
so keep `main` releasable.

Never rename the server key `datagrout` or DataGrout's tool names: users'
tool allowlists depend on them.

## Security

Report security or stability issues to [support@datagrout.ai](mailto:support@datagrout.ai).

## License

[MIT](LICENSE)
