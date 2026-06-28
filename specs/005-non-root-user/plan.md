# Non-Root User Implementation Plan

## Overview

Configure all Docker containers to run as non-root users following security best practices.

## Phases

### Phase 1: Backend Container (Day 1)

1. **Dockerfile Updates**
   - Add user creation commands
   - Set ownership of /app directory
   - Switch to non-root USER

2. **Permission Fixes**
   - Ensure temp directories writable
   - Set correct permissions for logs/cache

### Phase 2: Frontend Container (Day 2)

1. **Nginx Configuration**
   - Use nginx-unprivileged image OR
   - Configure standard nginx to run as nginx user
   - Change port from 80 to 8080

2. **Docker Compose Updates**
   - Update port mappings
   - Verify static file serving works

### Phase 3: Database Containers (Day 2)

1. **InfluxDB**
   - Verify official image runs as non-root
   - Check volume permissions

2. **Redis (if used)**
   - Verify non-root user configuration

### Phase 4: Security Hardening (Day 3)

1. **Additional Security Options**
   - Add read_only: true where possible
   - Drop all capabilities
   - Add no-new-privileges flag

2. **Testing**
   - Verify all containers start successfully
   - Confirm application functionality
   - Run security scan

## Dependencies

- Existing Dockerfiles
- docker-compose.yml

## Risks

| Risk | Mitigation |
|------|------------|
| Permission denied errors | Carefully set ownership in Dockerfile |
| Port binding issues | Use ports >1024 for non-root |
| Volume mount issues | Set correct uid:gid on host volumes |

## Definition of Done

- [ ] Backend runs as non-root user
- [ ] Frontend runs as non-root user
- [ ] All containers use unprivileged ports
- [ ] File permissions work correctly
- [ ] Application functions normally
- [ ] Security scan passes
