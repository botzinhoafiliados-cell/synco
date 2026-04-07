# SYNCO — Work Log

## Purpose
This file is the operational memory of the project.
Use it to track completed blocks, known debt, active risks, and the next execution steps.

---

## Completed Blocks
- BLOCO A — Base visual and navigation performance fixes
- BLOCO B — Global visual refinement
- BLOCO C — Radar refinement
- BLOCO D — Robustness and auth cleanup
- BLOCO E — Radar Base44 layout restoration
- BLOCO F — Standalone Quick Send flow
- BLOCO G — Login aligned with Modern Skeuo

---

## Infrastructure and Deploy
- Vercel production deploy fixed and validated
- ESLint conflict resolved by pinning ESLint 8.57.1
- `npm install`, `npm run build`, and `npx tsc --noEmit` validated locally
- Production branch flow corrected via merge to `main`

---

## Current Architecture Decisions
- Shopee first
- Mercado Livre second
- WasenderAPI as WhatsApp transport layer
- Queue per phone/session
- Affiliate configuration per user
- No product catalog persistence
- Minimal operational persistence only
- Idempotency required for send items
- Session loss must pause the job
- Wasender secrets must not be stored in `channels.config`

---

## Known Technical Debt
- Real Shopee conversion flow not fully implemented yet
- Wasender session lifecycle not fully integrated yet
- Group sync still depends on real Wasender integration
- Send queue worker per session still pending
- Minimal receipts retention cleanup still pending
- Mercado Livre adapter still pending

---

## Known Risks
- Shopee affiliate flow may depend on constraints outside the app
- Wasender session instability must be handled explicitly
- Without per-item idempotency, retries may duplicate sends
- Secrets must remain outside operational tables

---

## Next Steps
1. BLOCO H1 — Shopee-first real adapter foundation
2. BLOCO H2 — Affiliate settings per user
3. BLOCO H3 — Wasender session integration
4. BLOCO H4 — Session-based queue and controlled sending
5. BLOCO I — Mercado Livre integration
6. Payments after the core operational flow is stable

---

## Ownership Split
### Ezau
- Shopee adapter
- link processor
- send jobs
- send receipts
- idempotency
- queue per session
- pacing/retry/cooldown
- Mercado Livre after Shopee

### Other developer
- Wasender session lifecycle
- QR flow
- channels/groups UI
- groups sync
- webhooks
- session metadata
- secret handling
- status handling

---

## Update rule
Whenever a meaningful block is completed:
- append what changed
- note blockers
- note remaining risks
- update the next step if necessary