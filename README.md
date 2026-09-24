# Workforce Intelligence Platform

An MVP foundation for managers to review workforce records and update an actionable status for their team.

## MVP vertical slice

The first slice is intentionally narrow:

1. A signed-in manager requests the current team.
2. The manager lists workforce records for that team.
3. The manager updates a record's status.
4. The API enforces workspace scoping and records the mutation in an audit event.

The current implementation uses a dependency-free Node.js API with an in-memory repository so the contract and security boundaries can be exercised before choosing a production database and identity provider. The demo bearer tokens are development-only placeholders.

## Repository layout

- `apps/api/` — HTTP API, authorization boundary, in-memory domain repository, and tests.
- `apps/web/` — static browser shell for the first workflow.
- `packages/contracts/` — shared JSON API contract.
- `docs/adr/0001-mvp-architecture.md` — initial architecture decisions.

## Run locally

Requires Node.js 20 or newer.

```text
npm test
npm start
```

The API listens on `http://localhost:3000` by default. Open `http://localhost:3000/health` to verify readiness. The browser shell is available at `apps/web/index.html`; it expects the API at the same origin.

Development tokens:

- `demo-manager-token` — manager in `workspace-acme`
- `demo-member-token` — member in `workspace-acme`

These tokens must not be used outside local development.
