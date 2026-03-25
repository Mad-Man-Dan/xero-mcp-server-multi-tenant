# Changelog

All notable changes to this fork are documented here. This project is a fork of [XeroAPI/xero-mcp-server](https://github.com/XeroAPI/xero-mcp-server).

## [Unreleased]

### Added — Multi-Tenant Support
- **Authorization Code flow with PKCE** — new `AuthCodeXeroClient` using `openid-client` v6 for PKCE and direct axios token exchange (xero-node's built-in OAuth has incompatibilities with Xero's token endpoint)
- **Persistent token storage** — OAuth tokens cached at `~/.xero-mcp/tokens.json` with automatic refresh; browser re-auth only needed after 60+ days of inactivity
- **Tenant management tools:**
  - `list-xero-tenants` — list all connected organisations with active tenant indicator
  - `switch-xero-tenant` — switch the active organisation by tenant ID
- **Per-call tenant override** — every tool now accepts an optional `tenantId` parameter to target a specific org without switching globally
- **Core tenant infrastructure** on `MCPXeroClient`:
  - `getTenants()` — returns all connected tenants
  - `switchTenantId()` — validates and switches active tenant
  - `resolveTenantId()` — resolves per-call override or falls back to active tenant
  - Tenant-aware `getShortCode()` with per-tenant caching

### Added — Accounts (Chart of Accounts) CRUD
- `get-account` — retrieve a single account by ID
- `create-account` — create a new account with code, name, type, description, tax type
- `update-account` — update account fields or archive an account
- `delete-account` — delete an account (only if it has no transactions)

### Added — Generic Attachment Tools
- `list-attachments` — list attachments on any entity type (invoice, contact, bank transaction, manual journal, quote, credit note, receipt, purchase order, account, bank transfer, repeating invoice)
- `get-attachment` — download an attachment by filename, returned as base64-encoded content
- `upload-attachment` — upload a file to any entity type from base64 content or a local file path

### Changed — OAuth Scopes
- Migrated from deprecated umbrella scopes to **granular scopes**:
  - `accounting.transactions` → `accounting.invoices`, `accounting.payments`, `accounting.banktransactions`, `accounting.manualjournals` (+ `.read` variants)
  - `accounting.reports.read` → `accounting.reports.aged.read`, `accounting.reports.balancesheet.read`, `accounting.reports.profitandloss.read`, `accounting.reports.trialbalance.read`

### Changed — Auth & Client Improvements
- `dotenv.config()` now only loads `.env` as a fallback when env vars aren't already set (prevents MCP server config values from being overridden)
- `CustomConnectionsXeroClient.authenticate()` now calls `updateTenants()` to populate the tenants array
- `getDeepLink()` accepts optional `tenantId` for tenant-aware deep links
- `formatError()` now includes HTTP status and response body for unhandled Xero API errors
- Windows-compatible `openBrowser()` using `start "" "url"` to avoid the window title issue
- `OAuthCallbackServer` with 5-minute timeout and user-friendly HTML response
- `TokenStore` with atomic writes (write to `.tmp`, then rename)

### Infrastructure
- All 51 handler files updated to accept `tenantId?: string` and use `resolveTenantId()`
- All 50 tool files updated to pass `tenantId` through to handlers
- `CreateXeroTool` helper auto-injects `tenantId` into every tool's Zod schema
- `.gitignore` updated to exclude `.xero-mcp/` (token store directory)

## [0.0.14] — Upstream Baseline

Base version forked from [XeroAPI/xero-mcp-server@v0.0.14](https://github.com/XeroAPI/xero-mcp-server).
