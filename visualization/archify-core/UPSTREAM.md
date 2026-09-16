# Upstream provenance

- Project: Archify
- Repository: <https://github.com/Dreamaker-TA/archify.git>
- Revision: `7fe139ebe2e532941eb4c315057294348e88a2c0`
- Package version: `2.16.0-dev.0`
- Source subtree: `archify/`

The following upstream areas supplied this trimmed core:

- `renderers/architecture/`;
- the shared renderer modules required by Architecture;
- `LICENSE`.

The template, Architecture renderer, `renderers/shared/cli.mjs`, and the viewer
i18n catalog are
intentionally adapted for Cleanup Map: they remove brand capture, repository
evidence, and generic output-path workflows, and apply the cleanup camera/focus
behavior. The renderer also keeps visual palette types separate from Cleanup
role labels. `renderers/shared/validator.mjs` is replaced with a dependency-free
Architecture-only adapter. Cleanup Map validation happens before the Architecture
compiler runs.

Use the revision above as the comparison base when refreshing this core. Review
the retained cleanup adaptations with template/runtime changes as one unit.

## Maintenance boundary

This core ships with the Skill so report generation needs only Node.js, without
a separate Archify install or runtime package download. Simplify Codebase
maintainers own the bundled renderer and viewer, including local fixes;
upstream releases are not applied automatically.

The cleanup schema, compiler, and extension own Finding and snapshot semantics.
Viewer graph queries use only the active snapshot; native links retain its
Finding and stage. Keep those adaptations, explicit passport disclosure,
keyboard focus, text escaping, and offline delivery intact when syncing.

For a sync, compare the pinned revision with the selected upstream revision and
port only changes needed by the retained Architecture surface. Review local
adaptations together with the extension, retain both licenses and attribution,
and update the revision above. Run the renderer and browser suites documented
in [../README.md](../README.md#tests), then inspect Survey and Change at both
desktop acceptance sizes. Do not import excluded diagram types or general
Archify tooling as part of a sync.
