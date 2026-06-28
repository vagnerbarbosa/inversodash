# Health Checks Tasks

## Backend Implementation

- [ ] **TASK-001**: Create basic health endpoint
  - Add `GET /health` endpoint to main.py
  - Return JSON: `{"status": "healthy", "timestamp": "..."}`
  - Return HTTP 200
  - Size: Small
  - Dependencies: None

- [ ] **TASK-002**: Add database health check
  - Implement check_database() function
  - Attempt simple query or connection ping
  - Include result in health response
  - Size: Small
  - Dependencies: TASK-001

- [ ] **TASK-003**: Add Modbus connection health check
  - Check if Modbus client is connected
  - Verify recent successful reads
  - Include status in health response
  - Size: Small
  - Dependencies: TASK-001

- [ ] **TASK-004**: Implement health status aggregation
  - Determine overall status based on all checks
  - Return 503 if any critical check fails
  - Include individual check results
  - Size: Small
  - Dependencies: TASK-002, TASK-003

## Docker Configuration

- [ ] **TASK-005**: Add HEALTHCHECK to backend Dockerfile
  - Add `HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3`
  - Install curl: `RUN apt-get update && apt-get install -y curl`
  - CMD: `curl -f http://localhost:8000/health || exit 1`
  - Size: Small
  - Dependencies: TASK-001

- [ ] **TASK-006**: Configure docker-compose health checks
  - Add healthcheck section to backend service
  - Add healthcheck to frontend service
  - Configure intervals and timeouts
  - Size: Small
  - Dependencies: TASK-005

- [ ] **TASK-007**: Add restart policies
  - Configure `restart: unless-stopped` with condition
  - Use `depends_on` with condition for startup order
  - Size: Small
  - Dependencies: TASK-006

## Frontend Health

- [ ] **TASK-008**: Configure nginx health endpoint
  - Add location block for `/health` in nginx.conf
  - Return simple 200 OK response
  - Size: Small
  - Dependencies: None

## Testing

- [ ] **TASK-009**: Test health endpoints
  - Verify /health responds correctly
  - Test with healthy and unhealthy states
  - Verify 503 on failure
  - Size: Small
  - Dependencies: TASK-004

- [ ] **TASK-010**: Verify Docker health checks
  - Run `docker ps` to see health status
  - Verify unhealthy containers restart
  - Test startup behavior
  - Size: Small
  - Dependencies: TASK-007, TASK-009

## Documentation

- [ ] **TASK-011**: Document health check endpoints
  - Document /health response format
  - Explain health check configuration
  - Add troubleshooting guide
  - Size: Small
  - Dependencies: All above
