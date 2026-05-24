# Gemini CLI Project Rules

Gemini CLI must follow this repository's shared AI workflow.

## Priority

1. Read `AGENTS.md` before making changes.
2. Treat `AGENTS.md` as the source of truth for project rules, code style, Git workflow, review graph, gstack usage, and RTK usage.
3. Answer in Korean.

## Required Workflow

- Before editing, inspect the current files instead of relying on memory.
- For UI component work, inspect existing `Button` conventions first.
- After moving files, verify imports, package exports, and Storybook paths together.
- Do not change `pnpm-lock.yaml` unless dependency changes require it.
- Before suggesting a commit, review the changed-file scope and run the narrowest useful verification command.

## gstack Fallback

If gstack commands are available, use the relevant skill:

- General code review: `/review`
- Security/dependency/auth/env/CI/data review: `/cso`
- UI review: `/design-review` or `/qa`
- Context checkpoint: `/context-save`

If gstack is not available, follow the same review graph manually and state which checks were skipped.

## code-review-graph

Follow the `code-review-graph` subsection in `AGENTS.md`. Prefer MCP tools when connected; otherwise use the CLI fallbacks listed there.

## RTK Usage

When RTK is available, prefer compact shell output:

- `rtk git status`
- `rtk git diff`
- `rtk grep "pattern" .`
- `rtk tsc`
- `rtk lint biome`
- `rtk test <command>`

Use raw commands only when full output is necessary.
