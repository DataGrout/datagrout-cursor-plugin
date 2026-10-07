---
name: datagrout
description: Find a tool in DataGrout for a goal and run it — /datagrout <goal>
---

Follow the `datagrout-mcp` skill.

If no goal was given: call `discovery_summary`, list the connected integrations
in one line each, and ask what the user wants to do.

If a goal was given:

1. `discovery_discover` with the goal as a short phrase (under 10 words).
2. If it needs more than one tool, `discovery_plan` with `lean: true` and show the
   plan.
3. If any tool in the path has `side_effects` of `write` or `destructive`, state
   what will change and wait for a yes.
4. `discovery_perform` with the exact `tool_name` and `args`; use `head: true` for
   lists and `refract` to summarise.
5. Report the integration, the record identifiers touched, and credits charged.
