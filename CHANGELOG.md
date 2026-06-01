# Changelog

All notable changes to ReactDriver are documented here.

This project follows semantic versioning. Release commits are created by GitHub Actions and package publishing is handled from version tags.

---

## 1.0.1

- Published `@oqlet/react-driver` to npm with provenance.
- Added Vercel deployment support for the website.
- Fixed package type entry points to reference generated `.d.cts` declarations.
- Added public npm registry configuration for reproducible CI installs.
- Added website build verification to CI.
- Split release flow so branch CI creates version tags and tag CI publishes to npm.

---

## 1.0.0

- Initial public release.
- Added schema-driven `useTour` API backed by driver.js.
- Added JSX title/content support and custom popover rendering.
- Added cross-route lifecycle hooks.
- Added action-driven progression with `advanceOn`, `canAdvance`, and `autoAdvanceAfter`.
- Added persistence, progress resume, version invalidation, show count, and scheduled display.
- Added global tour registry, tour sequences, beacons, checklists, and tooltips.
- Added analytics callbacks, analytics adapters, localization presets, and testing utilities.
