# CardIQ Deployment & Rollback Runbook

## Standard Deployment (Zero-Downtime)
CardIQ utilizes GitHub Actions for continuous deployment.
1. Merge feature branch into `main`.
2. The `CD Pipeline` automatically builds the Docker image, tags it with the Git SHA, and pushes to ECR.
3. Kubernetes applies a `RollingUpdate`. Wait for `kubectl rollout status` to report success.

## Emergency Rollback
If a deployment introduces critical bugs or performance regressions:
1. Identify the previous stable Git SHA.
2. Run the rollback command targeting the specific deployment (frontend or backend):
   ```bash
   kubectl rollout undo deployment/cardiq-backend -n cardiq-prod
   ```
3. Monitor Prometheus/Grafana to ensure error rates drop back to baseline.
4. Revert the problematic commit in `main` to ensure the git history reflects the true state of production.

## Database Migrations
Migrations run automatically on backend pod startup.
- **Rule:** Migrations must ALWAYS be backwards compatible (e.g., adding a column is safe, renaming/dropping a column requires a multi-step release).
- If a migration fails, the pod will fail its readiness probe and Kubernetes will halt the rollout, preventing downtime.
