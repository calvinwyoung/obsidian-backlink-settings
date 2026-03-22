.PHONY: dev
dev:
	pnpm run dev

.PHONY: build
build:
	pnpm run build

.PHONY: test
test:
	pnpm run test

.PHONY: check
check:
	pnpm run check

.PHONY: fix
fix:
	pnpm run fix

# Bump the version, update manifest/versions files, and push a release branch.
# Usage: make bump-version TYPE=patch|minor|major
.PHONY: bump-version
bump-version:
ifndef TYPE
	$(error TYPE is required. Usage: make bump-version TYPE=patch|minor|major)
endif
	pnpm version $(TYPE) --no-git-tag-version
	$(eval VERSION := $(shell node -p "require('./package.json').version"))
	npm_package_version=$(VERSION) node version-bump.mjs
	git checkout -b release/$(VERSION)
	git add package.json manifest.json versions.json
	git commit -m "$(VERSION)"
	git push -u origin release/$(VERSION)

# Tag the current version on main and push it to trigger the release workflow.
# Run this after the bump-version PR has been merged.
.PHONY: release-tag
release-tag:
	git checkout main
	git pull origin main
	$(eval VERSION := $(shell node -p "require('./package.json').version"))
	git tag $(VERSION)
	git push origin $(VERSION)
