# Backlink Settings Plugin

This is a plugin for [Obsidian](https://obsidian.md/) that allows users to save preferred
settings for the backlinks / "Linked mentions" pane at the bottom of notes.

By default, Obsidian doesn't retain backlink settings so users need to adjust them each
time they open a new file.

This plugin allows users to save default values for the following options:

- "Sort order": The default sort order
- "Collapse results": Whether to collapse backlink results
- "Show more context": Whether to show more context with backlink results

These values get applied to the backlinks pane each time a file is opened.

## Installation

The plugin is available in the official [Community Plugins
repository](https://obsidian.md/plugins?id=backlink-settings).

## Usage

1. Open Obsidian Settings
2. Navigate to the "Backlink Settings" tab
3. Configure preferred settings

## Development

### Setup

1. Install [mise](https://mise.jdx.dev/) for tool version management
2. Run `mise install` to get the correct Node and pnpm versions
3. Run `pnpm install` to install dependencies

| Command | Description |
| --- | --- |
| `make dev` | Start dev build with watch mode |
| `make build` | Production build (type-checks then bundles) |
| `make test` | Run tests |

### Publishing

1. `make bump-version TYPE=<patch|minor|major>`: bumps version, creates a release branch,
   and pushes it
2. Open a PR on GitHub, review, and merge
3. `make release-tag`: pulls main, tags the merge commit, and pushes the tag
4. GitHub Actions builds the plugin and creates a **draft** release
5. Go to [GitHub
   Releases](https://github.com/calvinwyoung/obsidian-backlink-settings/releases) and
   publish the draft

> **Note:** `.npmrc` sets `tag-version-prefix=""` so tags are bare versions like `1.0.0` (no `v` prefix), which is what the GitHub Actions workflow expects.
