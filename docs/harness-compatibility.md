# Harness Compatibility / Harness 兼容性

`code-janitor` is one portable Agent Skills package. Its installation directory, SKILL.md frontmatter `name`, and invocation name are all `code-janitor`. This alignment is required by some harnesses and avoids platform-specific aliases.

`code-janitor` 是一个可移植的单一 Agent Skills 包。安装目录、SKILL.md 的 `name` 与调用名称统一为 `code-janitor`；部分 harness 要求三者一致，这一约定可避免平台专属别名。

## Portable contract / 可移植契约

- `SKILL.md` begins with only the portable `name` and `description` frontmatter fields.
- All detailed guidance is loaded through repository-relative Markdown links.
- Codex display metadata lives in `agents/openai.yaml`; other harnesses may ignore that optional file safely.
- Do not add vendor-only fields to `SKILL.md`. Put vendor-specific behavior in a separate adapter only when it is necessary and does not change the shared workflow.

Run this release check from the repository root:

```bash
python scripts/verify_harness_contract.py
```

## Supported discovery locations / 支持的发现目录

| Harness | User scope | Project scope | Verify |
| --- | --- | --- | --- |
| Codex | `~/.codex/skills/code-janitor/` | repository-specific Codex skill directory when configured | Start a new task and invoke `$code-janitor`. |
| Claude Code | `~/.claude/skills/code-janitor/` | `.claude/skills/code-janitor/` | Invoke `/code-janitor` or ask a matching request. |
| Cursor | `~/.agents/skills/code-janitor/` or `~/.cursor/skills/code-janitor/` | `.agents/skills/code-janitor/` or `.cursor/skills/code-janitor/` | Use `/code-janitor` or verify it appears in Customize → Skills. |
| GitHub Copilot | `~/.copilot/skills/code-janitor/` or `~/.agents/skills/code-janitor/` | `.github/skills/code-janitor/`, `.claude/skills/code-janitor/`, or `.agents/skills/code-janitor/` | Invoke `/code-janitor` or confirm it is listed by the Copilot client. |
| Cline | `~/.cline/skills/code-janitor/` | `.cline/skills/code-janitor/`, `.clinerules/skills/code-janitor/`, or `.claude/skills/code-janitor/` | Enable Skills, then invoke a matching request or confirm it appears in the Skills panel. |
| Gemini CLI | `~/.gemini/skills/code-janitor/` | `.gemini/skills/code-janitor/` | Run `/skills list`, then invoke or approve activation. |
| OpenCode | `~/.agents/skills/code-janitor/` or `~/.config/opencode/skills/code-janitor/` | `.agents/skills/code-janitor/` or `.opencode/skills/code-janitor/` | Confirm the `skill` tool advertises `code-janitor` in a new session. |

Use one location at the intended precedence level. Do not install a second copy with the same name unless an override is intentional.

选择目标优先级中的一个目录安装即可。除非明确需要覆盖，不要安装同名的第二份副本。

## Migration / 迁移

The former `$simplify-codebase` name and nested `defensive-code-cleanup` package have been consolidated into `$code-janitor`. Install the new package under a `code-janitor` directory, verify discovery, then remove the old copies only after confirming no workflow depends on their old names.

旧的 `$simplify-codebase` 名称与嵌套的 `defensive-code-cleanup` 包已合并为 `$code-janitor`。先在 `code-janitor` 目录安装新包并确认发现成功，再按需移除旧副本；若已有工作流依赖旧名称，应先完成迁移。

## Sources / 依据

- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Cursor Agent Skills](https://prod.cursor.com/docs/skills)
- [GitHub Copilot Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Cline Skills](https://docs.cline.bot/customization/skills)
- [Gemini CLI Agent Skills](https://geminicli.com/docs/cli/tutorials/skills-getting-started/)
- [OpenCode Agent Skills](https://opencode.ai/docs/skills)
