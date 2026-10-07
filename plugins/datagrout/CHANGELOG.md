# Changelog

All notable changes to this plugin will be documented here.

## 1.0.0 — initial release

- Added the `datagrout` MCP server pointing at DataGrout's hosted Streamable HTTP
  endpoint (`https://gateway.datagrout.ai/connect`).
- Auth uses OAuth 2.1 with automatic Dynamic Client Registration and PKCE: no API
  key, client ID or server ID to configure.
- Added the `datagrout-mcp` skill, the `datagrout` rule and the `/datagrout`
  command.
- Logo: DataGrout's official mark.
