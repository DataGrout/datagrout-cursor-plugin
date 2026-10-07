---
name: datagrout-mcp
description: Find and run tools in the user's connected systems (CRM, ticketing, chat, docs, email, calendar, finance, support, ERP and any other integration they connected in DataGrout) through DataGrout MCP. Use when the user asks for data or an action in an external system, or when no local tool fits the request.
---

# DataGrout MCP

DataGrout is one MCP server that fronts every integration the user connected.
Tool names are not known up front: discover them first, then run them through
`discovery_perform`. Never guess a tool name and never ask the user for API keys;
DataGrout is already authenticated.

## Tools

| Tool | Use it for | Parameters that matter |
| --- | --- | --- |
| `discovery_summary` | What is connected, once per session | `focus: "<integration>"` drills into one integration |
| `discovery_discover` | Find tools for a goal | `goal`: a short phrase, under 10 words, no metrics or instructions. Optional `integrations: ["slack"]`, `brief: true` |
| `discovery_plan` | Multi-step goals | `goal`, `lean: true`. Add `execute: true` to run it in the same call; `inputs: {}` fills `needed` holes |
| `discovery_perform` | Run a tool | `tool_name` (exact, `integration@1/tool@1`), `args`. Optional `head`, `refract`, `analyze`, `chart`, `schedule`, `skill_handle`, `estimate_only` |
| `discovery_guide` | Unclear goals | `goal` to start; then `session_id` + `choice` (option id) |

`discovery_discover` returns `tool_name`, `integration`, `score`, a compact signature
`tool(param: type, [opt: type])` and `side_effects`: `none`, `read`, `write`,
`destructive` or `unknown`.

## Workflow

1. **Orient** (first use in a session): `discovery_summary`. Skip it if the user
   already named the integration.
2. **Discover**: `discovery_discover` with the goal as a short phrase such as
   `"list open jira issues"` or `"post slack message"`. Pick the top result whose
   signature fits; read its parameters from the signature.
3. **Plan** only when the goal needs several tools: `discovery_plan` with
   `lean: true`. If `status` is `ready` and `needed` is empty, show the plan, then
   run it with `discovery_perform` and the returned `skill_handle` (or rerun plan
   with `execute: true`). If `needed` lists inputs, get them from the user or an
   earlier result.
4. **Perform**: `discovery_perform` with the exact `tool_name` and `args`.
   - Batch independent calls as a list of `{tool_name, args}` in one request.
   - For results that may be long lists, pass `head: true`: you get the shape, a
     preview and a `cache_ref`; browse it with `data-grout@1/prism.paginate@1` or
     filter it with the `data-grout@1/data.*@1` tools, passing the `cache_ref`.
   - To reshape or summarise, pass `refract: "<what you want>"` so only the
     summary comes back.
   - `schedule: "every weekday at 9am"` creates a scheduled run instead of running
     now; say so to the user.
5. **Detached runs**: a long call returns `status: "detached"` with a `task_ref`.
   Collect it with `discovery_perform`, `tool_name: "data-grout@1/tasks.wait@1"`,
   `args: {"task_ref": "<ref>"}`.
6. **Report**: name the integration and the record identifiers (keys, IDs, URLs)
   so the user can verify in the source system, and mention credits charged from
   `_dg.credits` when a call cost more than a few.

## Rules

- Ask the user before running any tool whose `side_effects` is `write` or
  `destructive`, and before running a plan that contains one. State what will
  change. Reads need no confirmation.
- Prefer a read-only tool when both a read and a write could satisfy the request.
- If the response has `loop_detected: true`, do not repeat the call. Use the
  previous result; only change the arguments if a second action is really wanted.
- If a call fails on its arguments, read the error, fix the arguments and retry
  once before asking the user.
- If cost matters, call `discovery_perform` with `estimate_only: true` first.
- On an authorization error, tell the user to open Settings → MCP → datagrout and
  click Connect. Do not retry in a loop.
- On "Insufficient credits", tell the user to top up in DataGrout and stop.
- Leave `demux` and `coverage_gaps` unset unless the user asks for them.
- Do not reach these systems with local scripts, `curl` or env-var tokens when
  DataGrout is connected.
