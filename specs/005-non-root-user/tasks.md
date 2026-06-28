# Non-Root User Tasks

## Backend Container

- [ ] **TASK-001**: Update backend Dockerfile with non-root user
  - Add `RUN groupadd -r appgroup && useradd -r -g appgroup appuser`
  - Add `RUN chown -R appuser:appgroup /app`
  - Add `USER appuser` before CMD
  - Size: Small
  - Dependencies: None

- [ ] **TASK-002**: Create writable directories for appuser
  - Ensure /tmp is writable (should be by default)
  - Create /app/logs with appuser ownership if needed
  - Size: Small
  - Dependencies: TASK-001

## Frontend Container

- [ ] **TASK-003**: Update frontend to use unprivileged nginx
  - Switch to `nginxinc/nginx-unprivileged:alpine` base image
  - OR configure nginx to run as nginx user
  - Change port from 80 to 8080
  - Size: Small
  - Dependencies: None

- [ ] **TASK-004**: Update docker-compose port mappings
  - Change frontend ports from "80:80" to "8080:8080"
  - Update any hardcoded references
  - Size: Small
  - Dependencies: TASK-003

## Docker Compose Security

- [ ] **TASK-005**: Add security options to docker-compose
  - Add `user: "1000:1000"` to services where applicable
  - Add `read_only: true` for backend
  - Add `security_opt: ["no-new-privileges:true"]`
  - Size: Small
  - Dependencies: TASK-001, TASK-003

- [ ] **TASK-006**: Configure capability dropping
  - Add `cap_drop: ["ALL"]` to all services
  - Add back only required capabilities if needed
  - Size: Small
  - Dependencies: TASK-005

## Testing

- [ ] **TASK-007**: Verify container users
  - Run `docker top` on each container
  - Confirm no root processes
  - Document any exceptions
  - Size: Small
  - Dependencies: TASK-001, TASK-003, TASK-005

- [ ] **TASK-008**: Test application functionality
  - Start all containers
  - Verify API endpoints work
  - Verify frontend loads
  - Verify WebSocket connections
  - Size: Small
  - Dependencies: TASK-007

## Documentation

- [ ] **TASK-009**: Document security configuration
  - Document user IDs used
  - Explain security options in docker-compose
  - Add troubleshooting for permission issues
  - Size: Small
  - Dependencies: TASK-008
