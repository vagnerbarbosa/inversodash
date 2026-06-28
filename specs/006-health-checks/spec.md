# Health Checks

## Summary

Implement comprehensive health checks for all services to enable proper container orchestration, monitoring, and automatic recovery.

## Motivation

Currently, containers have no health monitoring:
- Docker cannot detect unhealthy services
- No automatic restart on failure
- Kubernetes/Docker Swarm cannot manage deployments properly
- Difficult to determine system health at a glance

## Functional Requirements

1. **Backend Health Endpoint**: HTTP endpoint returning service status
2. **Dependency Checks**: Verify database and external service connectivity
3. **Docker Health Checks**: Configure HEALTHCHECK in Dockerfiles
4. **Frontend Health**: Simple endpoint to verify nginx serving
5. **Composite Status**: Overall system health aggregation

## Non-Functional Requirements

1. **Performance**: Health checks complete in < 2 seconds
2. **Isolation**: Health checks don't affect normal operations
3. **Accuracy**: Reflects actual service availability
4. **Lightweight**: Minimal resource overhead

## Technical Design

### Backend Health Endpoint

```python
@app.get("/health")
async def health_check():
    checks = {
        "database": check_database(),
        "modbus": check_modbus_connection(),
        "websocket": check_websocket_pool()
    }
    status = "healthy" if all(checks.values()) else "unhealthy"
    return {"status": status, "checks": checks}
```

### Dockerfile HEALTHCHECK

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1
```

### Docker Compose

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Success Criteria

1. Backend /health endpoint returns status and component health
2. Docker health checks configured in all services
3. Unhealthy containers automatically restart
4. Frontend has simple health endpoint
5. Health status visible in docker ps

## Out of Scope

- Kubernetes liveness/readiness probes (uses same endpoints)
- External monitoring integration (Datadog, etc.)
- Health check metrics export
