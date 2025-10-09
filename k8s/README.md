# Kubernetes Manifests for Aurora

This directory contains Kubernetes deployment manifests for all Aurora microservices with comprehensive health probes.

## 📁 Directory Structure

```
k8s/
├── identity/
│   ├── deployment.yaml  # Identity service deployment with probes
│   └── secrets.yaml     # Identity service secrets
├── thoughts/
│   ├── deployment.yaml  # Thoughts service deployment with probes
│   └── secrets.yaml     # Thoughts service secrets
├── journals/
│   ├── deployment.yaml  # Journals service deployment with probes
│   └── secrets.yaml     # Journals service secrets
├── planning/
│   ├── deployment.yaml  # Planning service deployment with probes
│   └── secrets.yaml     # Planning service secrets
└── README.md
```

## 🏥 Health Probes

All services implement three types of Kubernetes probes:

### 1. **Liveness Probe** (`/health/liveness`)
- **Purpose**: Checks if the service process is alive
- **Action on Failure**: Kubernetes restarts the pod
- **Configuration**:
  - Initial Delay: 30 seconds
  - Period: 10 seconds
  - Timeout: 5 seconds
  - Failure Threshold: 3 attempts

### 2. **Readiness Probe** (`/health/readiness`)
- **Purpose**: Checks if the service can handle requests (includes database connectivity)
- **Action on Failure**: Kubernetes stops sending traffic to this pod
- **Configuration**:
  - Initial Delay: 10 seconds
  - Period: 5 seconds
  - Timeout: 3 seconds
  - Failure Threshold: 3 attempts

### 3. **Startup Probe** (`/health/startup`)
- **Purpose**: Checks if the application has fully started
- **Action on Failure**: Keeps checking until success or max failures
- **Configuration**:
  - Initial Delay: 0 seconds (immediate)
  - Period: 5 seconds
  - Timeout: 3 seconds
  - Failure Threshold: 12 attempts (60 seconds max startup time)

## 🚀 Deployment

### Prerequisites

1. Kubernetes cluster (minikube, kind, or cloud provider)
2. `kubectl` configured
3. Docker images built for each service

### Build Docker Images

```bash
# From the project root
docker build -t aurora/identity:latest ./services/identity
docker build -t aurora/thoughts:latest ./services/thoughts
docker build -t aurora/journals:latest ./services/journals
docker build -t aurora/planning:latest ./services/planning
```

### Deploy to Kubernetes

Deploy all services:

```bash
# Deploy secrets first
kubectl apply -f k8s/identity/secrets.yaml
kubectl apply -f k8s/thoughts/secrets.yaml
kubectl apply -f k8s/journals/secrets.yaml
kubectl apply -f k8s/planning/secrets.yaml

# Deploy services
kubectl apply -f k8s/identity/deployment.yaml
kubectl apply -f k8s/thoughts/deployment.yaml
kubectl apply -f k8s/journals/deployment.yaml
kubectl apply -f k8s/planning/deployment.yaml
```

Or deploy everything at once:

```bash
kubectl apply -R -f k8s/
```

### Verify Deployment

```bash
# Check pod status
kubectl get pods

# Check services
kubectl get services

# Watch pod startup
kubectl get pods -w

# Check specific service
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name>

# Check health endpoints
kubectl port-forward svc/identity-service 5000:5000
curl http://localhost:5000/health
curl http://localhost:5000/health/liveness
curl http://localhost:5000/health/readiness
curl http://localhost:5000/health/startup
```

## 🔐 Secrets Management

⚠️ **IMPORTANT**: The `secrets.yaml` files contain example values. In production:

1. **Never commit real secrets to git**
2. Use one of these secret management solutions:
   - [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
   - [External Secrets Operator](https://external-secrets.io/)
   - Cloud provider secret managers (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager)
   - HashiCorp Vault

### Example: Using kubectl to create secrets from env file

```bash
kubectl create secret generic identity-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=jwt-secret="your-secret-key"
```

## 📊 Resource Configuration

Each service has resource requests and limits:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

Adjust these based on your workload requirements.

## 🔄 Rolling Updates

All deployments use `RollingUpdate` strategy:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # Max 1 extra pod during update
    maxUnavailable: 0  # No downtime during update
```

This ensures zero-downtime deployments.

## 📈 Scaling

Scale services manually:

```bash
kubectl scale deployment identity-service --replicas=3
kubectl scale deployment thoughts-service --replicas=3
kubectl scale deployment journals-service --replicas=3
kubectl scale deployment planning-service --replicas=3
```

Or enable horizontal pod autoscaling:

```bash
kubectl autoscale deployment identity-service --cpu-percent=70 --min=2 --max=10
```

## 🐛 Troubleshooting

### Pod not starting

```bash
# Check events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check previous container logs (if crashed)
kubectl logs <pod-name> --previous
```

### Health check failures

```bash
# Exec into pod
kubectl exec -it <pod-name> -- sh

# Test health endpoint manually
curl http://localhost:5000/health/readiness
```

### Database connectivity issues

```bash
# Check if database pods are running
kubectl get pods | grep postgres
kubectl get pods | grep mongo

# Test connection from service pod
kubectl exec -it <pod-name> -- sh
nc -zv postgres-identity 5432
```

## 🌐 Service Endpoints

Within the cluster, services are accessible at:

- **Identity**: `http://identity-service:5000`
- **Thoughts**: `http://thoughts-service:4001`
- **Journals**: `http://journals-service:4002`
- **Planning**: `http://planning-service:4003`

## 📝 Health Check Endpoints

All services expose these endpoints:

- `GET /health` - Legacy health check (backwards compatibility)
- `GET /health/liveness` - Liveness probe endpoint
- `GET /health/readiness` - Readiness probe endpoint
- `GET /health/startup` - Startup probe endpoint

### Example Responses

**Liveness** (always returns 200 if process is alive):
```json
{
  "status": "alive",
  "service": "identity",
  "timestamp": "2025-10-09T12:00:00.000Z",
  "uptime": 3600
}
```

**Readiness** (returns 200 if ready, 503 if not):
```json
{
  "status": "ready",
  "service": "identity",
  "timestamp": "2025-10-09T12:00:00.000Z",
  "checks": {
    "database": "connected"
  }
}
```

**Startup** (returns 200 when started, 503 while starting):
```json
{
  "status": "started",
  "service": "identity",
  "timestamp": "2025-10-09T12:00:00.000Z",
  "uptime": 10
}
```

## 🎯 Best Practices Implemented

✅ Separate liveness, readiness, and startup probes  
✅ Database connectivity checks in readiness probe  
✅ Rolling update strategy for zero-downtime deployments  
✅ Resource requests and limits  
✅ Graceful shutdown (30s termination grace period)  
✅ Labeled resources for easy management  
✅ Multiple replicas for high availability  
✅ Secrets externalized from configuration  

## 📚 Additional Resources

- [Kubernetes Liveness, Readiness, Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)

