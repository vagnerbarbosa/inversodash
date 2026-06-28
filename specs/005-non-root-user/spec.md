# Non-Root User Docker

## Summary

Configure all Docker containers to run as non-root users to improve security and follow container best practices.

## Motivation

Currently, containers run as root which presents security risks:
- Container breakout could compromise host system
- Privilege escalation attacks
- Violation of principle of least privilege
- Security scanners flag root containers as high risk

## Functional Requirements

1. **Backend Container**: Run as `appuser` (UID 1000)
2. **Frontend Container**: Run as `nginx` user
3. **Database Containers**: Use official non-root images
4. **File Permissions**: Correct ownership for volumes and files
5. **Port Binding**: Use unprivileged ports (8080 instead of 80)

## Non-Functional Requirements

1. **Security**: No process runs as root or has unnecessary capabilities
2. **Compatibility**: Application works identically to root version
3. **Debugging**: Still possible to exec into containers for troubleshooting

## Technical Design

### Backend Dockerfile Changes

```dockerfile
# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Set ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser
```

### Frontend Dockerfile Changes

```dockerfile
# Use nginx unprivileged image
FROM nginxinc/nginx-unprivileged:alpine

# Or configure standard nginx
RUN chown -R nginx:nginx /usr/share/nginx/html
USER nginx
```

### Docker Compose Updates

```yaml
services:
  backend:
    user: "1000:1000"
    read_only: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
```

## Success Criteria

1. All containers run as non-root users
2. Application functions identically to before
3. No root processes visible in `docker top`
4. File permissions correctly set in volumes
5. Security scan passes (no root user warnings)

## Out of Scope

- Rootless Docker daemon setup
- User namespace remapping
- SELinux/AppArmor profiles
