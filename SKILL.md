---
name: arklib-agent-api
description: Use this skill when an AI agent needs deterministic read access and wallet-signed write intents for the Arklib knowledge base through /api/agent/v1. Covers setup, wallet session challenge flow, read endpoints, write-intent generation, intent execution, and error handling.
---

# Arklib Agent API Skill

## Setup
1. Install dependencies: `pnpm install`
2. Start app: `pnpm dev`
3. Base URL: `http://localhost:3000`
4. Inspect API spec: `GET /api/agent/v1/openapi`

## Wallet Session Challenge Flow
Use existing wallet-auth endpoints to establish a private-read/write-intent session.

1. Request nonce message:
```bash
curl -s http://localhost:3000/api/auth/wallet/nonce
```
2. Sign returned `message` with the wallet.
3. Verify signature:
```bash
curl -s -X POST http://localhost:3000/api/auth/wallet/verify \
  -H 'content-type: application/json' \
  -d '{"address":"0x...","message":"...","signature":"0x..."}'
```
4. Confirm session:
```bash
curl -s http://localhost:3000/api/agent/v1/auth/session
```

## Read Endpoints
- `GET /api/agent/v1/meta`
- `GET /api/agent/v1/spaces`
- `GET /api/agent/v1/spaces/{spaceSlug}`
- `GET /api/agent/v1/spaces/{spaceSlug}/pages?q=&status=&parent=&sort=&owner=`
- `GET /api/agent/v1/spaces/{spaceSlug}/pages/{pageSlug}`
- `GET /api/agent/v1/spaces/{spaceSlug}/pages/{pageSlug}/revisions`
- `GET /api/agent/v1/spaces/{spaceSlug}/pages/{pageSlug}/backlinks`
- `GET /api/agent/v1/search/pages?q=&spaceSlug=&status=&parent=&sort=&owner=`

Read responses always use envelope form:
```json
{ "data": ... }
```

## Write Intent Flow
Write endpoints return a validated `AgentWriteIntent`. They do not submit transactions.

1. Call an intent endpoint, for example:
```bash
curl -s -X POST http://localhost:3000/api/agent/v1/intents/pages/update \
  -H 'content-type: application/json' \
  -d '{
    "spaceSlug":"arkiv-demo",
    "pageSlug":"getting-started",
    "title":"Getting Started",
    "summary":"Updated",
    "bodyMarkdown":"Updated body",
    "status":"published",
    "editSummary":"Agent update"
  }'
```
2. Read `data.intent.sdkCall` and optional `data.intent.followUpCalls`.
3. Execute calls with the connected wallet client.
4. Verify postconditions via listed read paths.

## Intent Execution Helper
Use `executeAgentIntent` for in-app agents:

```ts
import { executeAgentIntent } from '@/features/agent/execute-intent'

const result = await executeAgentIntent(walletClient, intent)
```

This helper:
- decodes serialized payload bytes,
- executes `sdkCall` + `followUpCalls`,
- resolves placeholders like `{{primary.entityKey}}`,
- returns tx hashes and affected entity keys.

## Presence Wrappers
Agent-safe presence lifecycle routes:
- `POST /api/agent/v1/presence/join`
- `PATCH /api/agent/v1/presence/renew`
- `DELETE /api/agent/v1/presence/leave`

Join enforces that body `viewer` matches authenticated session wallet.

## Error Handling
Error responses use:
```json
{
  "error": {
    "code": "AUTH_REQUIRED|FORBIDDEN|NOT_FOUND|CONFLICT|VALIDATION_ERROR|UPSTREAM_ERROR",
    "message": "...",
    "details": {}
  }
}
```

Use `code` for agent branching logic; treat message as human-readable context.

## Demo Commands
```bash
curl -s http://localhost:3000/api/agent/v1/meta | jq
curl -s http://localhost:3000/api/agent/v1/spaces | jq
curl -s "http://localhost:3000/api/agent/v1/search/pages?q=presence&status=published" | jq
curl -s http://localhost:3000/api/agent/v1/openapi | jq '.paths | keys'
```
