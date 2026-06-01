# Contributing

Thanks for considering a contribution to ReactDriver.

---

## Setup

```bash
git clone https://github.com/goutham-05/react-driver.git
cd react-driver
npm install
```

For the website:

```bash
cd website
npm install
```

---

## Development

```bash
npm run dev
npm --prefix website run dev
```

---

## Testing

```bash
npm test
npm run build
npm run test:e2e
```

Before opening a PR, make sure the package and website build:

```bash
npm run build
npm run vercel-build
```

---

## Pull Requests

- Use conventional commit messages, for example `feat: add tooltip placement option`.
- Add tests for new behavior.
- Update `README.md`, `CHANGELOG.md`, or website docs when the public API changes.
- Keep changes focused; avoid formatting-only churn.

---

## Release Flow

Pushes to `main` run CI and create version tags through GitHub Actions. Tag workflows publish to npm with provenance.
