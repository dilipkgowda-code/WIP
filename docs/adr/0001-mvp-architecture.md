# ADR 0001: MVP architecture

## Status

Accepted for the first vertical slice.

## Decision

Start with a small Node.js HTTP API and browser client, with shared JSON contracts under `packages/contracts/`. Keep domain access behind a repository interface so the in-memory implementation can be replaced by a relational database without changing the transport contract. Keep authentication and role policy behind `apps/api/src/auth.js`; the demo token map is development-only.

Every record query and mutation carries the authenticated workspace identifier. Status changes emit audit events. Production must replace the demo identity map with managed OIDC/session authentication and the in-memory repository with a transactional database.

## Consequences

- The initial slice runs without installing dependencies.
- The API contract is stable enough for a real frontend while the product domain is validated.
- The in-memory store is not durable and must not receive production data.
- Production readiness still requires migrations, managed authentication, secret management, CI, observability, and deployment configuration.
