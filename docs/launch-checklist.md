# CardIQ Production Launch Checklist

This checklist must be fully verified by the engineering and product teams before migrating DNS to route live traffic to the production EKS cluster.

## 1. Product & Core Flows
- [ ] **Onboarding:** Verified new user signup, wallet state hydration, and persistence.
- [ ] **Optimizer Engine:** Verified sub-200ms response times for the primary calculation endpoint.
- [ ] **AI Copilot:** Verified streaming responses render correctly and gracefully fallback to deterministic summaries on provider timeout.
- [ ] **Mobile UX:** Verified touch ergonomics and virtual keyboard behavior on physical iOS and Android devices.

## 2. Infrastructure & Reliability
- [ ] **DNS & SSL:** Verified `cardiq.ai` and `api.cardiq.ai` point to the AWS Application Load Balancer and TLS certificates are valid (Cert-Manager).
- [ ] **Database (RDS):** Verified Multi-AZ is enabled and automated backups are configured for 7-day retention.
- [ ] **Redis (ElastiCache):** Verified memory limits and eviction policies (`allkeys-lru`) are correctly set.
- [ ] **Scaling (HPA):** Verified backend scales automatically when CPU > 70% during load tests.

## 3. Security
- [ ] **Secrets:** Verified all hardcoded secrets are removed. AWS Secrets Manager is successfully injecting credentials into EKS.
- [ ] **Rate Limiting:** Verified NGINX Ingress limit (50 req/s) and Application limit (100 req/15min) are enforced.
- [ ] **Authentication:** Verified JWT rotation and strict secure/HttpOnly cookie settings.
- [ ] **CORS:** Verified backend only accepts requests from `https://cardiq.ai`.

## 4. Observability & QA
- [ ] **Smoke Tests:** Executed `smoke-test.sh` successfully on the live production environment.
- [ ] **E2E Tests:** Playwright suite passes 100% on `main` branch.
- [ ] **Metrics:** Verified Prometheus is actively scraping `/metrics` and Grafana dashboards are populated.
- [ ] **Alerts:** Verified Slack/Email alerts trigger for Pod restarts and 5xx API errors.

## 5. Legal & Compliance
- [ ] **Privacy Policy:** Accessible from the footer, detailing data handling and AI provider data-sharing rules.
- [ ] **Terms of Service:** Up to date.
- [ ] **Financial Disclaimers:** Visible in the AI Copilot ("Not financial advice").

## Sign-off
**Date:** ___________________
**Engineering Lead:** ___________________
**Product Lead:** ___________________
