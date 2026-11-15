@AGENTS.md

# CLAUDE.md

AGENTS.md is canonical and binding; the hooks in `.claude/` enforce parts of it (generated files, keys, licences, masters are blocked).

- Use plan mode first for anything that changes brand values, public names, workflows, keys or licensing, and ask before any outward-facing action (push, tag, release, publish, GitHub/Figma settings or secrets).
- Never print, read or regenerate private keys. Use the GitHub noreply identity for commits.
- Finish with the full command list from AGENTS.md, and report honestly what was not verified (for example platform toolchains that only CI compiles).
