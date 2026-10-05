---
track: "devops"
role: "devops"
title: "DevOps"
icon: "⚙️"
summary: "Lộ trình cho DevOps: CI/CD, Docker & container, Infrastructure as Code, monitoring/alerting, và bảo mật pipeline."
levels:
  - key: "basic"
    title: "Cơ bản"
    desc: "Hiểu văn hóa DevOps, vòng CI/CD, Linux/shell, networking, và container hóa với Docker."
  - key: "intermediate"
    title: "Trung cấp"
    desc: "Networking cloud (VPC/LB/DNS/IAM), CI/CD pipeline, orchestration với Kubernetes, và monitoring/logging/alerting."
  - key: "advanced"
    title: "Nâng cao"
    desc: "SRE, IaC & supply chain, cost/scaling, GitOps, service mesh, database ops, secret management, platform engineering, chaos engineering, và policy as code."
---

## Về lộ trình này

Lộ trình dành cho người làm **DevOps** — vai trò đứng giữa dev và vận hành, chịu trách
nhiệm đưa code từ máy lập trình viên lên production một cách **nhanh, an toàn, lặp lại được**.

Học tuần tự từ **Cơ bản → Trung cấp → Nâng cao**. Bạn bắt đầu với nền tảng (văn hóa
DevOps, Linux, networking, Docker), sau đó dựng pipeline CI/CD và hệ thống giám sát, cuối
cùng là hạ tầng dạng code và bảo mật pipeline. Mỗi bài có phần **checklist** tự đánh giá —
tick khi bạn tự tin đã nắm. Tiến độ tính theo số item đã tick.

### Bản đồ 16 bài

| Cấp | Bài | Trọng tâm |
|-----|-----|-----------|
| Cơ bản | DevOps là gì & nền tảng | Văn hóa, CI/CD loop, Linux/shell, networking, Git cho ops |
| Cơ bản | Container hóa với Docker | Image vs container, Dockerfile, compose, best practice |
| Trung cấp | Cloud & networking nâng cao | VPC/subnet, load balancer, DNS, CDN, security group, IAM |
| Trung cấp | CI/CD pipeline | Stages, GitHub Actions/GitLab CI, secret, deploy strategy |
| Trung cấp | Kubernetes & orchestration | Pod/Deployment/Service, self-healing, scaling, probe, Ingress |
| Trung cấp | Monitoring, logging & alerting | Metrics/logs/traces, Prometheus/Grafana, SLI/SLO |
| Nâng cao | Reliability & incident (SRE) | Error budget, incident lifecycle, post-mortem, RTO/RPO |
| Nâng cao | IaC & bảo mật pipeline | Terraform/Helm/K8s, Vault, image scan, supply chain |
| Nâng cao | Cost, scaling & performance | Scale ngang/dọc, autoscale, săn lãng phí cloud, load test, p95/p99 |
| Nâng cao | GitOps & continuous deployment | Git là nguồn sự thật, ArgoCD/Flux, canary auto-rollback |
| Nâng cao | Service mesh & networking nội bộ | Sidecar proxy, mTLS zero-trust, retry/circuit breaking |
| Nâng cao | Database ops & migration tại scale | Expand/contract, né khóa bảng, backup/restore, replica |
| Nâng cao | Secret & config management chuyên sâu | Dynamic secret, rotation, External Secrets/SOPS, xử lý khi lộ |
| Nâng cao | Platform engineering & IDP | Hạ tầng như sản phẩm, golden path, self-service, cognitive load |
| Nâng cao | Chaos engineering & resilience testing | Tiêm lỗi có kiểm soát, blast radius, giả thuyết, nút dừng khẩn |
| Nâng cao | Compliance & policy as code | OPA/Kyverno, shift-left + admission control, audit trail |

Bài học liên kết với các skill DevOps sẵn có (`/nta-cicd-gen`, `/nta-docker-gen`,
`/nta-devops-review`, `/nta-devops-security`, `/nta-monitor-review`, `/nta-deploy-checklist`,
`/nta-load-test-plan`, `/nta-infra-gen`, `/nta-scale-check`, `/nta-incident`, `/nta-env-gen`,
`/nta-migration-gen`, `/nta-db-review`, `/nta-project-init`) để áp dụng ngay vào project thật —
học tới đâu, chạy skill tới đó.
