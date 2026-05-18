# CardIQ DevOps & Production Infrastructure

## Overview
CardIQ utilizes an enterprise-grade, AWS-centric infrastructure designed for zero-downtime deployments, horizontal scalability, and strict security compliance. The stack leverages Terraform for IaC, GitHub Actions for CI/CD, and Kubernetes (EKS) for container orchestration.

## Containerization Strategy
- **Multi-Stage Builds:** `frontend.Dockerfile` and `backend.Dockerfile` utilize Alpine Linux and multi-stage building. Only compiled artifacts (`.next/standalone` and `dist/`) are copied to the final production image, minimizing the attack surface and reducing image sizes.
- **Rootless Execution:** Containers run under the `nextjs` (UID 1001) and `nestjs` (UID 1001) user groups respectively, preventing root escalation within the container boundary.

## Kubernetes Architecture (EKS)
- **High Availability:** Deployments are configured with `replicas: 3` (backend) and `replicas: 2` (frontend). The `RollingUpdate` strategy (`maxSurge: 1`, `maxUnavailable: 0`) ensures zero downtime during CD rollouts.
- **Autoscaling:** A `HorizontalPodAutoscaler` dynamically scales the backend between 3 and 10 pods based on CPU (70% threshold) and Memory (80% threshold) utilization.
- **Health Checks:** Liveness (`/health/live`) and Readiness (`/health/ready`) probes ensure traffic is only routed to healthy pods and automatically restart deadlocked containers.
- **Edge Protection:** The NGINX Ingress controller acts as the edge boundary, enforcing TLS termination via Cert-Manager and providing initial Layer 7 rate limiting (`limit-rps: 50`).

## Infrastructure as Code (Terraform)
The AWS environment is fully codified in `infrastructure/terraform/`:
- **VPC:** Deployed across 3 Availability Zones (AZs) with private subnets for EKS worker nodes and databases, ensuring they are not directly exposed to the internet.
- **RDS (PostgreSQL):** Configured as Multi-AZ for automatic failover. Automated backups are retained for 7 days.
- **ElastiCache (Redis):** Deployed within the private subnet for caching optimization and rate-limit tracking.

## CI/CD Pipeline (GitHub Actions)
- **Continuous Integration (`ci.yml`):** Triggered on PRs to `main`. Runs `npm run lint`, `npm run typecheck`, `npm run test`, and an `npm audit` requiring high security standards.
- **Continuous Deployment (`cd.yml`):** Triggered on pushes to `main`. 
  1. Authenticates with AWS via OIDC (no long-lived access keys).
  2. Builds and pushes tagged images to ECR.
  3. Uses `sed` to patch the Kubernetes manifests with the new image SHA.
  4. Applies the manifests and waits for the rollout to complete via `kubectl rollout status`.

## Security Hardening
- **Application Level:** The NestJS backend is hardened with `helmet` for secure HTTP headers, strictly configured CORS, and `express-rate-limit` (100 reqs/15m) to prevent brute-force and DDoS attacks.
- **Observability:** `nestjs-prometheus` exposes a `/metrics` endpoint. A custom `prometheus-config.yaml` is configured to dynamically scrape all Kubernetes services annotated with `prometheus.io/scrape: "true"`.
