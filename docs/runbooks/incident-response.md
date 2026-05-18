# CardIQ Incident Response Runbook

## AI Provider Outage (OpenAI / Anthropic)
**Symptoms:** 503 errors on `/api/ai/*` endpoints, chat stream failures.
**Action Plan:**
1. Check external provider status pages.
2. In the Admin Dashboard (`/admin/feature-flags`), toggle `AI_PRIMARY_PROVIDER` to the fallback provider.
3. If all providers are down, toggle `ENABLE_AI_COPILOT` to `false`. This gracefully degrades the UI, hiding the chat interfaces and relying solely on the deterministic calculation UI.

## Redis Memory Exhaustion
**Symptoms:** High API latency, BullMQ scraper queues stalling, "OOM command not allowed" errors in Sentry.
**Action Plan:**
1. Connect to AWS ElastiCache via the bastion host.
2. Run `MEMORY STATS` to identify the largest keys.
3. If caused by scraper caching, adjust the TTL in `cache.service.ts` temporarily via the admin dashboard config overrides.
4. If critical, trigger a manual scale-up of the ElastiCache node type via Terraform and apply.

## RDS PostgreSQL Failover
**Symptoms:** Brief downtime (1-2 mins), spike in 500 errors, "Connection refused" to DB.
**Action Plan:**
1. Wait for AWS RDS Multi-AZ automatic failover to complete.
2. The Kubernetes pods will crash-loop during the failover; let Kubernetes restart them automatically once the new primary node is accepting connections.
3. Verify data integrity of the last 5 minutes of transactions via the admin audit logs.
