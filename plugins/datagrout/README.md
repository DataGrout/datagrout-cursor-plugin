# DataGrout for Cursor

DataGrout MCP puts every integration you connect in DataGrout (CRM, ticketing,
docs, chat, data and other SaaS tools) behind one OAuth-secured endpoint. This
plugin connects Cursor's agent to DataGrout MCP and teaches it to discover the
right tool, plan multi-step work, and confirm before it changes anything.

## Install

- **Cursor Marketplace:** open **Customize** in the sidebar, search for **DataGrout**,
  select **Install**, and choose project or user scope.
- **Team marketplace (Teams and Enterprise):** an admin opens
  **Dashboard → Plugins & MCPs → Add Marketplace → Import from Repo**, pastes
  `https://github.com/DataGrout/datagrout-cursor-plugin`, and installs **DataGrout**.
- **Local:** copy `plugins/datagrout` from this repository to
  `~/.cursor/plugins/local/datagrout` (copy, do not symlink), then run
  **Developer: Reload Window**.
- **MCP server only (no skill, rule or command):**
  [Add to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=datagrout&config=eyJ1cmwiOiJodHRwczovL2dhdGV3YXkuZGF0YWdyb3V0LmFpL2Nvbm5lY3QifQ==)

The plugin adds:

| Component | Name | Purpose |
| --- | --- | --- |
| MCP server | `datagrout` | `https://gateway.datagrout.ai/connect` over Streamable HTTP |
| Skill | `datagrout-mcp` | The discover → plan → perform workflow |
| Rule | `datagrout` | Reaches for DataGrout when you mention a system outside the repo |
| Command | `/datagrout` | Find a tool for a goal and run it |

## Connect

1. You need a DataGrout account with at least one integration connected — sign up at
   [datagrout.ai](https://datagrout.ai).
2. In Cursor, open **Settings → MCP**. The `datagrout` server shows a **Connect** button.
3. Select **Connect**. Your browser opens the DataGrout sign-in and consent page
   (OAuth 2.1 with automatic client registration and PKCE). Approve, and the browser
   returns you to Cursor.
4. The server turns healthy and its tools appear. No API key or server ID is needed;
   DataGrout identifies your account from the OAuth token.

## Tools

DataGrout MCP exposes five tools. Every other integration tool is reached through them,
so the list stays the same no matter how many integrations you connect.

| Tool | What it does | Returns |
| --- | --- | --- |
| `discovery_discover` | Semantic search for tools that fit a goal | Ranked tool names with input schemas and side-effect flags |
| `discovery_perform` | Runs a tool (or a planned `skill_handle`); `head: true` previews large lists, `refract` summarises | The tool's result plus execution ID and credits used |
| `discovery_plan` | Plans a goal that needs several tools | Ranked plans, required inputs, and a `skill_handle` to run the plan |
| `discovery_summary` | Overview of what is connected | Integrations with tool counts; `focus` drills into one |
| `discovery_guide` | Step-by-step decision tree when the goal is unclear | Options to choose from at each step |

Try: `/datagrout list my open Jira issues`, or ask "what's the latest message in our
#support Slack channel?".

## Data access and privacy

- DataGrout can reach only the integrations you connected, with the permissions
  you granted each one. Disconnect an integration in DataGrout and it is
  gone from Cursor too.
- Cursor sends DataGrout the goals and arguments the agent puts in tool calls, and
  receives the results. Nothing from your codebase is sent unless the agent includes
  it in a tool argument.
- Read and write tools are both available. The skill tells the agent to ask you before
  any tool that creates, updates, sends or deletes, and Cursor asks you to approve
  each tool call unless you have turned on auto-run.
- Tool calls use DataGrout credits from your account; each result reports the
  credits charged.
- This plugin contains only configuration and Markdown. No code runs on your machine.
- Privacy policy and terms: [datagrout.ai/legal](https://datagrout.ai/legal).

## Troubleshooting

- **Server shows an error or never connects:** open the Output panel
  (Cmd/Ctrl+Shift+U), select **MCP Logs**, and look for the OAuth or initialization
  error.
- **"Authentication required" or tools stop working:** open **Settings → MCP →
  datagrout** and select **Connect** again.
- **Connected but no tools:** check that your DataGrout account has at least one
  integration connected, then toggle the server off and on in **Customize**.
- **Revoke access:** remove the server in **Settings → MCP**, then revoke Cursor's
  authorization in your DataGrout account at [app.datagrout.ai](https://app.datagrout.ai).
- **Two copies of the plugin:** a Marketplace install takes precedence over a local
  copy with the same name; uninstall one.

## Support

Email [support@datagrout.ai](mailto:support@datagrout.ai). Documentation:
[library.datagrout.ai](https://library.datagrout.ai/).

## License

MIT — see [LICENSE](https://github.com/DataGrout/datagrout-cursor-plugin/blob/main/LICENSE).
